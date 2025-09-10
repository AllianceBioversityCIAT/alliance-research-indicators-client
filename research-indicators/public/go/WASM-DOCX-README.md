### Recompilar WASM

Si modificas el código Go, recompila WASM:

```bash
# En el directorio raíz del proyecto Go
GOOS=js GOARCH=wasm go build -o main.wasm main.go

# Copiar a Angular
cp main.wasm wasm_exec.js
```
