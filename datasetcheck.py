import pandas as pd

# Load Excel file
file_path = "toxic_words.xlsx"
df = pd.read_excel(file_path, engine="openpyxl", header=0)

# Normalize column names
df.columns = df.columns.str.strip()  # Remove spaces

# Print column names
print("Final Column names:", df.columns.tolist())

# Convert "Toxic Word" column to lowercase
df["Toxic Word"] = df["Toxic Word"].str.lower()

print("Dataset processed successfully!")
