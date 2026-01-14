export const STATUS_COLOR_MAP: Record<string, { border: string; text: string, background?: string }> = {
  '0': { border: '#1689CA', text: '#1689CA' },
  '1': { border: '#7C9CB9', text: '#153C71' }, // Ongoing - Blue border, dark blue text
  '2': { border: '#7C9CB9', text: '#173F6F' }, // Completed 
  '3': { border: '#F58220', text: '#F58220' }, // Suspended - Orange
};
