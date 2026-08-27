
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", () => {
    if (productId) {
        loadDynamicFeedbacks(productId);
    }

    // 2. Feedback Form Toggle (Open/Close) Logic
    const toggleBtn = document.getElementById('toggleFormBtn');
    const formContainer = document.getElementById('feedbackFormContainer');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            if (formContainer.style.display === "none" || formContainer.style.display === "") {
                formContainer.style.display = "block";
                this.innerHTML = '<i class="fa-solid fa-xmark"></i> Close Form';
            } else {
                formContainer.style.display = "none";
                this.innerHTML = '<i class="fa-solid fa-pen"></i> Write a Review';
            }
        });
    }

    // 3. Feedback Form Submit Logic
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                product_id: parseInt(productId),
                user_name: document.getElementById('reviewerName').value,
                rating: parseInt(document.getElementById('reviewRating').value),
                comment: document.getElementById('reviewerMessage').value
            };

            try {
                const response = await fetch("http://127.0.0.1:8000/api/contact/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert("✅ Feedback submitted successfully!");
                    feedbackForm.reset(); // Form clear pannidum
                    formContainer.style.display = "none"; // Form hide pannidum
                    toggleBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Write a Review';
                    loadDynamicFeedbacks(productId); // List-a refresh pannaum
                } else {
                    alert("❌ Submission failed.");
                }
            } catch (err) {
                console.error("Post Feedback Error:", err);
            }
        });
    }
});

// 4. Function: Load Feedbacks dynamically
async function loadDynamicFeedbacks(pId) {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    try {
        // Specific product ID-ku reviews ketkurom
        const response = await fetch(`http://127.0.0.1:8000/api/contact/feedback?product_id=${pId}`);
        const feedbacks = await response.json();

        if (feedbacks.length === 0) {
            reviewsList.innerHTML = `<p class="empty-msg">No reviews yet for this product.</p>`;
            return;
        }

        // Reviews display pannaum
        reviewsList.innerHTML = feedbacks.map(item => `
            <div class="review-item" style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>${item.user_name}</strong>
                    <span style="color: #FFA500;">${generateStars(item.rating)}</span>
                </div>
                <p style="font-size: 0.9rem; color: #555; margin-top: 5px;">${item.comment}</p>
            </div>
        `).join('');

    } catch (err) {
        console.error("Load Feedbacks Error:", err);
    }
}