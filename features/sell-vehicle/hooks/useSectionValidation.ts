const isValueFilled = (v: any) => {
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" ? v.trim() !== "" : Boolean(v);
  };
  
  export function useSectionValidation(fields: string[], data: any) {
    const values = fields.map((f) => data[f]);
  
    const isValid = values.every(isValueFilled);
    const isFilled = values.some(isValueFilled);
  
    return {
      isValid,
      isFilled,
    };
  }