export const generateInitialChatContext = (parsedData: any, gptSummary: any) => {
  return [
    {
      role: "system",
      content: "You're Finora, an AI financial assistant."
    },
    {
      role: "user",
      content:
        `My monthly income is ₹${parsedData.income} and here are my expenses:\n` +
        Object.entries(parsedData.expenses || parsedData.categories || {})
          .map(([k, v]) => `${k}: ₹${v}`)
          .join("\n")
    },
    {
      role: "assistant",
      content: gptSummary
    }
  ];
}; 