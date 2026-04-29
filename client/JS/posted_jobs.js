const jobtitleInp = document.querySelector(".jobtitle");
const jobdescriptionInp = document.querySelector(".jobdescription");
const submitBtn = document.querySelector(".submitBtn");
const jobForm = document.querySelector(".jobForm");

renderPostedJobs();

setInterval(renderPostedJobs, 5000);

document.querySelector(".create_job_btn").addEventListener("click", () => {
    document.querySelector(".create_job_menu").style.visibility = "visible";
    document.querySelector(".hidden").classList.add("backdrop");
});

document.querySelector(".add_btn_in1").addEventListener("click", () => {
    document.querySelector(".create_job_menu").style.visibility = "visible";
    document.querySelector(".hidden").classList.add("backdrop");
});
document.querySelector(".add_btn_in2").addEventListener("click", () => {
    document.querySelector(".create_job_menu").style.visibility = "visible";
    document.querySelector(".hidden").classList.add("backdrop");
});
document.querySelector(".add_btn_in3").addEventListener("click", () => {
    document.querySelector(".create_job_menu").style.visibility = "visible";
    document.querySelector(".hidden").classList.add("backdrop");
});

document.querySelector(".hidden").addEventListener("click", () => {
    document.querySelector(".create_job_menu").style.visibility = "hidden";
    document.querySelector(".hidden").classList.remove("backdrop");
});

document.querySelector(".close_window_btn").addEventListener("click", () => {
    document.querySelector(".create_job_menu").style.visibility = "hidden";
    document.querySelector(".hidden").classList.remove("backdrop");
});

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
            jobForm.reset();
        }
    } catch (e) {
        console.error(e);
    }
});

async function renderAcceptedJobs() {
    try {
        const res = await fetch("http://localhost:3000/api/jobs/accepted");
        if (!res.ok) throw new Error(`${res.status}`);
        
        const data = await res.json(); 

    } catch(e) {

    }
}

async function renderPostedJobs() {
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

                if (jobs[i].worker_id === null && jobs[i].pending_worker === null) {
                    jobBox.innerHTML = `
                        <p class="job_title">${jobs[i].title}</p>
                        <p class="job_description">${jobs[i].description}</p>

                        <div class="applyer_box">
                            <p class="accepted_by">Accepted by: <b>Pending</b></p>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="job_info">
                                <p>by ${firstName} ${lastName}</p>
                                <p>Posted date: ${jobs[i].dateCreated}</p>
                            </div>
                            <div class="job_edit">
                                <button class="edit_btn editJobBtn"><i class="fa-solid fa-pen-to-square" style="color: rgb(99, 230, 190);"></i></button>
                                <button class="edit_btn deleteJobBtn" data-id="${currentJobId}"><i class="fa-solid fa-trash-can" style="color: rgb(255, 93, 93);"></i></button>
                            </div>
                        </div>`
                } else if (jobs[i].worker_id === null && jobs[i].pending_worker !== null) {
                    jobBox.innerHTML = `
                        <p class="job_title">${jobs[i].title}</p>
                        <p class="job_description">${jobs[i].description}</p>
                        <div class="applyer_box">
                            <p class="accepted_by">Accepted by: <b>${jobs[i].applier_first_name} ${jobs[i].applier_last_name}</b></p>

                            <div class="decision_box">
                                <button class="view_profile_btn viewProfileBtn" data-id="${currentJobId}">View profile</button>
                                <button class="accept_worker_btn acceptWorkerBtn" data-id="${currentJobId}">Accept worker</button>
                                <button class="decline_worker_btn declineWorkerBtn" data-id="${currentJobId}">Decline worker</button>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="job_info">
                                <p>by ${firstName} ${lastName}</p>
                                <p>Posted date: ${jobs[i].dateCreated}</p>
                            </div>
                            <div class="job_edit">
                                <button class="edit_btn editJobBtn"><i class="fa-solid fa-pen-to-square" style="color: rgb(99, 230, 190);"></i></button>
                                <button class="edit_btn deleteJobBtn" data-id="${currentJobId}"><i class="fa-solid fa-trash-can" style="color: rgb(255, 93, 93);"></i></button>
                            </div>
                        </div>`
                } else {
                    jobBox.innerHTML = `
                        <p class="job_title">${jobs[i].title}</p>
                        <p class="job_description">${jobs[i].description}</p>

                        <div class="applyer_box">
                            <p class="accepted_by">Job is in progress<br><br>The result of job will appear here</p>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="job_info">
                                <p>by ${firstName} ${lastName}</p>
                                <p>Posted date: ${jobs[i].dateCreated}</p>
                            </div>
                            <div class="job_edit">
                                <button class="edit_btn editJobBtn"><i class="fa-solid fa-pen-to-square" style="color: rgb(99, 230, 190);"></i></button>
                                <button class="edit_btn deleteJobBtn" data-id="${currentJobId}"><i class="fa-solid fa-trash-can" style="color: rgb(255, 93, 93);"></i></button>
                            </div>
                        </div>`
                }
            }
        }
    } catch (e) {
        console.error("Failed to render jobs:", e);
    }
};

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".acceptWorkerBtn");
    const applyerBox = e.target.closest(".applyer_box");

    if (btn) {
        const jobId = Number(btn.getAttribute("data-id"));
        console.log("Found ID:", jobId);

        const res = await fetch("/api/jobs/pending/worker/accept", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: jobId })
        })

        if (res.ok) {
            console.log("Accepted successfuly");
            applyerBox.innerHTML = "Job is in progress by a worker of your choice.";
        } else {
            alert("Failed to accept worker.");
        }
    }
});

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".declineWorkerBtn");
    const applyerBox = e.target.closest(".applyer_box");

    if (btn) {
        const jobId = Number(btn.getAttribute("data-id"));
        console.log("Found ID:", jobId);

        const res = await fetch("/api/jobs/pending/worker/decline", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: jobId })
        })

        if (res.ok) {
            console.log("Declined successfuly");
            applyerBox.innerHTML = "Worker succesfully declined from this job.";
        } else {
            alert("Failed to decline worker.");
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