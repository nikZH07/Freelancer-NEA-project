renderMarketplace();

async function renderMarketplace() {
    const jobsContainer = document.querySelector(".view_all_jobs_container");
    try {
        const res = await fetch("http://localhost:3000/api/marketplace/jobs");
        if (!res.ok) throw new Error(`${res.status}`);

        const data = await res.json();

        data.forEach(row => {
            jobsContainer.innerHTML += `<div class="job_box">
                                            <p class="job_title">${row.title}</p>
                                            <p class="job_description">${row.description}</p>
                                            <div class="job_info">
                                                <p>by ${row.first_name} ${row.last_name}</p>
                                                <p>Posted date: ${row.dateCreated}</p>
                                            </div>
                                        </div>`  
        });

    } catch (e) {
        console.error("Failed to render jobs:", e);
    }
};