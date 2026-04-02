const jobtitleInp = document.querySelector(".jobtitle");
const jobdescriptionInp = document.querySelector(".jobdescription");
const submitBtn = document.querySelector(".submitBtn");
const jobForm = document.querySelector(".jobForm");
const successMessage = document.querySelector(".success_m");
const failureMessage = document.querySelector(".failure_m");


renderJobs();

setInterval(renderJobs, 5000);

jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("form intercepted")

    const jobtitle = jobtitleInp.value;
    const jobdescription = jobdescriptionInp.value;

    try {
        const res = await fetch("http://localhost:3000/api/jobs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ jobtitle, jobdescription })
        });
        if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`)
        } else {    
            const data = await res.json();
            failureMessage.classList.remove("view");
            successMessage.classList.add("view");
            jobForm.reset();
        }
    } catch (e) {
        console.error(e);
        successMessage.classList.remove("view");
        failureMessage.classList.add("view");
    }
});

async function renderJobs() {
    try {
        const res = await fetch("http://localhost:3000/api/jobs/posted");
        if (!res.ok) throw new Error(`${res.status}`);
        
        const data = await res.json(); 

        const jobs = data.jobs;
        const firstName = data.userFirstName;
        const lastName = data.userLastName;

        const limit = Math.min(jobs.length, 3); 

        for (let i = 0; i < limit; i++) {
            const jobBox = document.querySelector(`.job_box${i}`);
            
            if (jobBox && jobs[i]) {
                jobBox.classList.remove("empty_box");
                const currentJobId = jobs[i].id;
                
                jobBox.innerHTML = `
                    <p class="job_title">${jobs[i].title}</p>
                    <p class="job_description">${jobs[i].description}</p>
                    <p>Accepted by: ${jobs[i].worker_first_name} ${jobs[i].worker_last_name}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="job_info">
                            <p>by ${firstName} ${lastName}</p>
                            <p>Posted date: ${jobs[i].dateCreated}</p>
                        </div>
                        <div class="job_edit">
                            <button class="edit_btn editJobBtn"><i class="fa-solid fa-pen-to-square" style="color: rgb(99, 230, 190);"></i></button>
                            <button class="edit_btn deleteJobBtn" data-id="${currentJobId}"><i class="fa-solid fa-trash-can" style="color: rgb(255, 93, 93);"></i></button>
                        </div>
                    </div>
                `;
            }
        }
    } catch (e) {
        console.error("Failed to render jobs:", e);
    }
};

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