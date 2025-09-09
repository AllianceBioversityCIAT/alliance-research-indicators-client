package main

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"strings"
	"syscall/js"
)



func processDocxWasm(this js.Value, args []js.Value) interface{} {
    if len(args) < 2 {
        return map[string]interface{}{
            "success": false,
            "error": "Se requieren 2 parámetros: templateData (Uint8Array) y dropdowns (Array)",
        }
    }

    templateDataJS := args[0]
    dropdownsJS := args[1]

    if dropdownsJS.Type() != js.TypeObject || dropdownsJS.Get("length").Type() == js.TypeUndefined {
        return map[string]interface{}{
            "success": false,
            "error": "El segundo parámetro debe ser un array de dropdowns",
        }
    }

    dropdownsLength := dropdownsJS.Get("length").Int()

    type DropdownData struct {
        DropdownID    string
        SelectedValue string
        Type          string
    }

    var dropdowns []DropdownData
    for i := 0; i < dropdownsLength; i++ {
        dropdownObj := dropdownsJS.Index(i)
        dropdownID := dropdownObj.Get("dropdownId").String()
        selectedValue := dropdownObj.Get("selectedValue").String()
        controlType := dropdownObj.Get("type").String()

        dropdowns = append(dropdowns, DropdownData{
            DropdownID:    dropdownID,
            SelectedValue: selectedValue,
            Type:          controlType,
        })
    }

    length := templateDataJS.Get("length").Int()

    if length == 0 {
        return map[string]interface{}{
            "success": false,
            "error": "El template está vacío",
        }
    }

    templateData := make([]byte, length)
    js.CopyBytesToGo(templateData, templateDataJS)

    defer func() {
        if r := recover(); r != nil {
            // Silently handle panics
        }
    }()

    reader := bytes.NewReader(templateData)
    zipReader, err := zip.NewReader(reader, int64(len(templateData)))
    if err != nil {
        return map[string]interface{}{
            "success": false,
            "error": fmt.Sprintf("Error abriendo documento: %v", err),
        }
    }

    var documentXML *zip.File
    for _, file := range zipReader.File {
        if file.Name == "word/document.xml" {
            documentXML = file
            break
        }
    }

    if documentXML == nil {
        return map[string]interface{}{
            "success": false,
            "error": "Documento DOCX inválido: falta word/document.xml",
        }
    }

    xmlReader, err := documentXML.Open()
    if err != nil {
        return map[string]interface{}{
            "success": false,
            "error": fmt.Sprintf("Error leyendo documento: %v", err),
        }
    }
    defer xmlReader.Close()

    xmlContent, err := io.ReadAll(xmlReader)
    if err != nil {
        return map[string]interface{}{
            "success": false,
            "error": fmt.Sprintf("Error leyendo contenido: %v", err),
        }
    }

    xmlString := string(xmlContent)
    totalProcessed := 0
    var failedDropdowns []string

    for _, dropdown := range dropdowns {
        dropdownPattern := fmt.Sprintf(`<w:id w:val="%s"/>`, dropdown.DropdownID)
        if strings.Contains(xmlString, dropdownPattern) {
            dropdownStart := strings.Index(xmlString, dropdownPattern)
            if dropdownStart == -1 {
                failedDropdowns = append(failedDropdowns, dropdown.DropdownID)
                continue
            }

            sdtStart := strings.LastIndex(xmlString[:dropdownStart], "<w:sdt>")
            if sdtStart == -1 {
                failedDropdowns = append(failedDropdowns, dropdown.DropdownID)
                continue
            }

            sdtEnd := strings.Index(xmlString[dropdownStart:], "</w:sdt>")
            if sdtEnd == -1 {
                failedDropdowns = append(failedDropdowns, dropdown.DropdownID)
                continue
            }

            sdtEndPos := dropdownStart + sdtEnd + len("</w:sdt>")
            dropdownSection := xmlString[sdtStart:sdtEndPos]
            controlType := dropdown.Type

            var modifiedSection string
            switch controlType {
            case "dropdown":
                modifiedSection = updateDropdownSelection(dropdownSection, dropdown.SelectedValue)
            case "text":
                modifiedSection = updateTextSelection(dropdownSection, dropdown.SelectedValue)
            default:
                chooseItemPattern := `<w:t>Choose an item.</w:t>`
                processedValue := processLineBreaks(dropdown.SelectedValue)
                modifiedSection = strings.ReplaceAll(dropdownSection, chooseItemPattern, processedValue)
            }

            if modifiedSection != dropdownSection {
                xmlString = xmlString[:sdtStart] + modifiedSection + xmlString[sdtEndPos:]
                totalProcessed++
            } else {
                failedDropdowns = append(failedDropdowns, dropdown.DropdownID)
            }
        } else {
            failedDropdowns = append(failedDropdowns, dropdown.DropdownID)
        }
    }

    if totalProcessed == 0 {
        return map[string]interface{}{
            "success": false,
            "error": fmt.Sprintf("No se pudo procesar ningún dropdown. Fallidos: %v", failedDropdowns),
        }
    }

    var outputBuffer bytes.Buffer
    zipWriter := zip.NewWriter(&outputBuffer)

    for _, file := range zipReader.File {
        writer, err := zipWriter.Create(file.Name)
        if err != nil {
            return map[string]interface{}{
                "success": false,
                "error": fmt.Sprintf("Error creando archivo: %v", err),
            }
        }

        if file.Name == "word/document.xml" {
            _, err = writer.Write([]byte(xmlString))
        } else {
            reader, err := file.Open()
            if err != nil {
                continue
            }
            _, err = io.Copy(writer, reader)
            reader.Close()
        }

        if err != nil {
            return map[string]interface{}{
                "success": false,
                "error": fmt.Sprintf("Error escribiendo archivo: %v", err),
            }
        }
    }

    err = zipWriter.Close()
    if err != nil {
        return map[string]interface{}{
            "success": false,
            "error": fmt.Sprintf("Error finalizando documento: %v", err),
        }
    }

    outputBytes := outputBuffer.Bytes()
    wasmBytes := js.Global().Get("Uint8Array").New(len(outputBytes))
    js.CopyBytesToJS(wasmBytes, outputBytes)

    return map[string]interface{}{
        "success": true,
        "message": fmt.Sprintf("Documento procesado exitosamente: %d/%d dropdowns modificados", totalProcessed, len(dropdowns)),
        "fileData": wasmBytes,
    }
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}

// processLineBreaks converts line breaks in text to Word XML format
func processLineBreaks(text string) string {
    if text == "" {
        return ""
    }

    // Split text by line breaks (handle both \n and \r\n)
    lines := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")

    if len(lines) <= 1 {
        // No line breaks, return simple text element
        return fmt.Sprintf(`<w:r w:rsidR="00730B13"><w:rPr><w:color w:val="0070C0"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US"/></w:rPr><w:t>%s</w:t></w:r>`, text)
    }

    // Multiple lines, build XML with line breaks
    var result strings.Builder

    for i, line := range lines {
        // Add text element for each line
        result.WriteString(fmt.Sprintf(`<w:r w:rsidR="00730B13"><w:rPr><w:color w:val="0070C0"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US"/></w:rPr><w:t>%s</w:t></w:r>`, line))

        // Add line break between lines (except after the last line)
        if i < len(lines)-1 {
            result.WriteString(`<w:r w:rsidR="00730B13"><w:rPr><w:color w:val="0070C0"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US"/></w:rPr><w:br/></w:r>`)
        }
    }

    return result.String()
}



func updateDropdownSelection(sdtXML, selectedValue string) string {
	result := strings.ReplaceAll(sdtXML, "<w:showingPlcHdr/>", "")

	contentStart := strings.Index(result, "<w:sdtContent>")
	contentEnd := strings.Index(result, "</w:sdtContent>")

	if contentStart == -1 || contentEnd == -1 {
		return result
	}

	// Process line breaks in the selected value
	processedValue := processLineBreaks(selectedValue)
	newContent := fmt.Sprintf(`<w:sdtContent>%s</w:sdtContent>`, processedValue)

	beforeContent := result[:contentStart]
	afterContent := result[contentEnd+len("</w:sdtContent>"):]

	return beforeContent + newContent + afterContent
}

func updateTextSelection(sdtXML, selectedValue string) string {
	result := strings.ReplaceAll(sdtXML, "<w:showingPlcHdr/>", "")

	contentStart := strings.Index(result, "<w:sdtContent>")
	contentEnd := strings.Index(result, "</w:sdtContent>")

	if contentStart == -1 || contentEnd == -1 {
		patterns := []string{
			`<w:t>Choose an item.</w:t>`,
			`<w:t>Enter Project code and title</w:t>`,
		}

		// Process line breaks in the selected value
		processedValue := processLineBreaks(selectedValue)
		newValuePattern := fmt.Sprintf(`%s`, processedValue)
		for _, pattern := range patterns {
			if strings.Contains(result, pattern) {
				return strings.ReplaceAll(result, pattern, newValuePattern)
			}
		}
		return result
	}

	// Process line breaks in the selected value
	processedValue := processLineBreaks(selectedValue)

	var newContent string
	if strings.Contains(result, "<w:tc>") {
		newContent = fmt.Sprintf(`<w:sdtContent><w:tc><w:tcPr><w:tcW w:w="4961" w:type="dxa"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="nil"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2" w:themeFill="background1" w:themeFillShade="F2"/></w:tcPr><w:p w14:paraId="77A59F33" w14:textId="0D341366" w:rsidR="00D93092" w:rsidRPr="002F02E5" w:rsidRDefault="00DF1D8E" w:rsidP="00491955"><w:pPr><w:pStyle w:val="Heading5"/><w:rPr><w:color w:val="0070C0"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US"/></w:rPr></w:pPr>%s</w:p></w:tc></w:sdtContent>`, processedValue)
	} else {
		newContent = fmt.Sprintf(`<w:sdtContent>%s</w:sdtContent>`, processedValue)
	}

	beforeContent := result[:contentStart]
	afterContent := result[contentEnd+len("</w:sdtContent>"):]

	return beforeContent + newContent + afterContent
}



func main() {
    js.Global().Set("processDocxWasm", js.FuncOf(processDocxWasm))
    select {}
}
