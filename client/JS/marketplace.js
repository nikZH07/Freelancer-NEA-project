renderMarketplace();

async function renderMarketplace() {
    const jobsContainer = document.querySelector(".view_all_jobs_container");
    try {
        const res = await fetch("http://localhost:3000/api/marketplace/jobs");
        if (!res.ok) throw new Error(`${res.status}`);

        const data = await res.json();

        data.forEach(row => {
            if (row.status === "available") {
                jobsContainer.innerHTML += `
                <div class="job_box">
                    <p class="job_title">${row.title}</p>
                    <p class="job_description">${row.description}</p>
                    <div class="job_info">
                        <p>by ${row.first_name} ${row.last_name}</p>
                        <p>Posted date: ${row.dateCreated}</p>
                    </div>
                    <button class="job_apply_btn" data-id="${row.id}">APPLY FOR JOB</button>
                </div>`
            }
        });

    } catch (e) {
        console.error("Failed to render jobs:", e);
    }
};

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".job_apply_btn");

    if (btn) {
        const jobId = Number(btn.getAttribute("data-id"));
        console.log("Found ID:", jobId);

        const res = await fetch('/api/job/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: jobId })
        });

        if (res.ok) {
            console.log("Applied successfuly")
        } else {
            alert("Failed to accept job.")
        }
    }

});

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".deleteJobBtn");
    
    if (btn) {
        const jobId = Number(btn.getAttribute("data-id"));
        console.log("Found ID:", jobId);

        const response = await fetch('/api/jobs/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: jobId })
        });

        if (response.ok) {
            console.log("Delete successful");
            btn.closest('[class*="job_box"]').innerHTML = "<p>Job Deleted</p>";
        } else {
            alert("Failed to delete job.");
        }
    }
});