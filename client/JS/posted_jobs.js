const jobtitleInp = document.querySelector(".jobtitle");
const jobdescriptionInp = document.querySelector(".jobdescription");
const submitBtn = document.querySelector(".submitBtn");
const jobForm = document.querySelector(".jobForm");

renderPostedJobs();
loadAcceptedMissions();

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

// 1. THE TRIGGER (Watches for clicks on ANY "View Profile" button)
document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('view_profile_btn')) {
        const workerId = event.target.getAttribute('data-id');
        console.log("Button clicked! Target ID:", workerId);
        
        if (workerId) {
            await openProfile(workerId);
        }
    }
});

// 2. THE LOGIC (Fetches and displays)
async function openProfile(workerId) {
    try {
        const response = await fetch(`/api/worker/${workerId}`);
        if (!response.ok) throw new Error("Worker not found in DB");
        
        const worker = await response.json();
        console.log("Data received:", worker);

        document.getElementById('p_name').innerText = (worker.first_name || '') + " " + (worker.last_name || '');
        document.getElementById('p_industry').innerText = worker.industry || "N/A";
        document.getElementById('p_exp').innerText = worker.years_experience || "0";
        document.getElementById('p_phone').innerText = worker.phone_num || "No Phone";
        document.getElementById('p_bio').innerText = worker.bio || "No bio provided.";

        const modal = document.getElementById('profileModal');
        const backdrop = document.getElementById('modalBackdrop');
        
        modal.classList.remove('hidden');
        backdrop.classList.remove('hidden');
        modal.style.display = 'block';
        backdrop.style.display = 'block';

    } catch (err) {
        console.error("Error opening profile:", err);
    }
}

document.addEventListener('click', (e) => {
    if (e.target.closest('.close_profile_btn') || e.target.id === 'modalBackdrop') {
        document.getElementById('profileModal').style.display = 'none';
        document.getElementById('modalBackdrop').style.display = 'none';
    }
});
async function loadAcceptedMissions() {
    const container = document.getElementById('acceptedJobsContainer');
    
    try {
        const response = await fetch('/api/my-accepted-jobs');
        const jobs = await response.json();

        if (jobs.length === 0) {
            container.innerHTML = `<p style="color:white;">No accepted jobs found.</p>`;
            return;
        }

        container.innerHTML = ''; 

        jobs.forEach(job => {
            const jobBox = document.createElement('div');
            jobBox.className = 'job_box_accepted';
            
            jobBox.innerHTML = `
                <p class="job_title_text">${job.title}</p>
                <p class="job_desc_text">${job.description}</p>
                
                <div class="applier_box_accepted">
                    <p class="accepted_by_text">Accepted by: <b>${job.first_name} ${job.last_name}</b></p>
                    <p style="font-size: 0.8rem; color: #8a929e; margin-top: 5px;">
                        Contact: ${job.phone_num || 'Private'}
                    </p>
                </div>

                <div class="job_footer_flex">
                    <div class="job_info_details">
                        <p>by ${job.first_name} ${job.last_name}</p>
                        <p>Posted date: ${job.dateCreated}</p>
                    </div>
                    <button class="neon_confirm_btn" onclick="confirmJob(${job.id}, this)">
                        CONFIRM
                    </button>
                </div>
            `;
            container.appendChild(jobBox);
        });
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

async function confirmJob(jobId, element) {
    if (!confirm("Are you sure you want to confirm and finish this mission?")) return;

    const response = await fetch(`/api/finish-job/${jobId}`, { method: 'DELETE' });
    const result = await response.json();

    if (result.success) {
        // Smoothly remove the box from the UI without reloading
        element.closest('.job_box_accepted').remove();
    } else {
        alert("Error completing mission.");
    }
}

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
                                <button class="view_profile_btn viewProfileBtn" data-id="${jobs[i].pending_worker}">View profile</button>
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