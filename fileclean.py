import pandas as pd

# Load the dataset
df = pd.read_excel("toxic_words.xlsx")

# Select only the 4 required columns (Replace with actual column names)
df = df[["Toxic Word", "Non-Toxic Alternatives 1", "Non-Toxic Alternatives 2", "Non-Toxic Alternatives 3"]]

# Save back to Excel (optional)
df.to_excel("filtered_toxic_words.xlsx", index=False)
