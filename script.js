const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const chatOutput = document.getElementById("chat-output");

// API Endpoint
const API_URL = "http://127.0.0.1:8000/check_comment/";

// Auto-expand text area
chatInput.addEventListener("input", function () {
    this.style.height = "20px";
    this.style.height = this.scrollHeight + "px";
});

// Handle send button click
sendBtn.addEventListener("click", sendMessage);

// Handle Enter key press
chatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// Function to send a message and process the response
async function sendMessage() {
    let text = chatInput.value.trim();
    if (text !== "") {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            if (!result || !result.status) {
                throw new Error("Invalid response from server.");
            }

            let messageDiv;
            if (result.status === "clean") {
                messageDiv = showMessage("✅ Clean Comment", highlightText(result.text, {}), "green");
            } else {
                messageDiv = showMessage(
                    "⚠️ Toxic Comment Detected!",
                    highlightText(result.text, result.suggestions),
                    "red"
                );
                displaySuggestions(result.suggestions, messageDiv, result.text);
            }

            chatInput.value = "";
            chatInput.style.height = "20px";
        } catch (error) {
            console.error("Error:", error);
            showMessage("❌ Error", "Could not connect to the server!", "red");
        }
    }
}

// Function to Show Messages in a Scrollable Output Box
function showMessage(title, message, color) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message");
    msgDiv.style.color = color;
    msgDiv.style.borderLeftColor = color;
    msgDiv.innerHTML = `<strong class="msg-title">${title}</strong><br><span class="message-text">${message}</span>`;
    
    chatOutput.appendChild(msgDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;

    return msgDiv;
}

// ✅ Enhanced Function to Highlight Toxic Words in All Languages
function highlightText(text, suggestions) {
    let highlightedText = text;

    for (let toxicWord in suggestions) {
        const toxicRegex = new RegExp(`(?<!\\p{L})${toxicWord}(?!\\p{L})`, "giu");
        highlightedText = highlightedText.replace(
            toxicRegex,
            `<span class="toxic-word" style="color:red;">${toxicWord}</span>`
        );
    }

    return highlightedText;
}

// Function to Display Suggestions and Replace Toxic Words
function displaySuggestions(suggestions, messageDiv, originalText) {
    const suggestionContainer = document.createElement("div");
    suggestionContainer.classList.add("suggestion-container");

    Object.keys(suggestions).forEach((toxicWord) => {
        const wordContainer = document.createElement("div");
        wordContainer.classList.add("word-container");

        const label = document.createElement("span");
        label.innerHTML = `<strong>${toxicWord}:</strong>`;
        label.style.color = "red";
        wordContainer.appendChild(label);

        suggestions[toxicWord].forEach((alternative) => {
            const btn = document.createElement("button");
            btn.classList.add("suggestion-btn");
            btn.textContent = alternative;

            btn.onclick = function () {
                let updatedText = messageDiv.querySelector(".message-text").innerHTML;

                // Improved regex for Unicode toxic word matching
                let regex = new RegExp(`(?<!\\p{L})${toxicWord}(?!\\p{L})`, "giu");  
                updatedText = updatedText.replace(regex, `<span style="color:green;">${alternative}</span>`);

                messageDiv.querySelector(".message-text").innerHTML = updatedText;
                wordContainer.remove();

                if (suggestionContainer.children.length === 0) {
                    suggestionContainer.remove();
                }

                let remainingToxicWords = Object.keys(suggestions).some(word => updatedText.includes(word));
                if (!remainingToxicWords) {
                    messageDiv.querySelector(".msg-title").innerHTML = "✅ Cleaned Comment";
                    messageDiv.style.color = "green";
                    messageDiv.style.borderLeftColor = "green";
                }
            };

            wordContainer.appendChild(btn);
        });

        suggestionContainer.appendChild(wordContainer);
    });

    chatOutput.appendChild(suggestionContainer);
}
