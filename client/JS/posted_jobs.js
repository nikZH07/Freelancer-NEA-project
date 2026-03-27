const jobtitleInp = document.querySelector(".jobtitle");
const jobdescriptionInp = document.querySelector(".jobdescription");
const submitBtn = document.querySelector(".submitBtn");
const messageF = document.querySelector(".message");
const jobForm = document.querySelector(".jobForm");
const deleteBtn = document.querySelector(".deleteBtn");
const successMessage = document.querySelector(".success_m");
const failureMessage = document.querySelector(".failure_m");

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

deleteBtn.addEventListener("click", async () => {
    const deleteB = deleteBtn.innerHTML;
    console.log(deleteB);

    try {
        const res = await fetch("http://localhost:3000/api/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ deleteB })
        })
        if (!res.ok) throw new Error(`${res.status} ${res.statusTexts}`)
        const data = res.json();
        console.log(data);
        failureMessage.classList.remove("view");
        successMessage.classList.add("view");
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

        const limit = Math.min(data.length, 3); 

        for (let i = 0; i < limit; i++) {
            const jobBox = document.querySelector(`.job_box${i}`);
            if (jobBox && data[i]) {
                jobBox.classList.remove("empty_box");
                jobBox.innerHTML = `
                    <p class="job_title">${data[i].title}</p>
                    <p class="job_description">${data[i].description}</p>
                    <div class="job_info">
                        <p>by ${data[i].firstname} ${data[i].lastname}</p>
                        <p>Posted date: ${data[i].dateCreated}</p>
                    </div>
                `;
            };
        };
    } catch (e) {
        console.error("Failed to render jobs:", e);
    }
}

renderJobs();