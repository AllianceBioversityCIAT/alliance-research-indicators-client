export const STATUS_COLOR_MAP: Record<string, { border: string; text: string }> = {
  '': { border: '#1689CA', text: '#1689CA' },
  '0': { border: '#1689CA', text: '#1689CA' },
  '1': { border: '#7C9CB9', text: '#153C71' }, // Ongoing - Blue border, dark blue text
  '2': { border: '#7C9CB9', text: '#173F6F' }, // Completed - Green
  '3': { border: '#F58220', text: '#F58220' }, // Suspended - Orange
  '4': { border: '#79D9FF', text: '#1689CA' },
  '5': { border: '#E69F00', text: '#F58220' }, // Revise - Orange border, dark orange text
  '6': { border: '#7CB580', text: '#235B2D' }, // Approved - Green border, dark green text
  '7': { border: '#F16937', text: '#CF0808' }, // Rejected - Red border, dark red text
  '8': { border: '#777C83', text: '#4C5158' }, 
  '9': { border: '#E69F00', text: '#F58220' },
  '10': { border: '#7CB580', text: '#235B2D' }, // OICR Approved - Green border, dark green text
  '11': { border: '#E69F00', text: '#F58220' }, // OICR Postpone - Orange border, dark orange text
};
