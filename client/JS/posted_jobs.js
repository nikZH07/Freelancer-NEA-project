const firstnameInp = document.querySelector(".firstname");
const lastnameInp = document.querySelector(".lastname");
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
    
    const firstname = firstnameInp.value;
    const lastname = lastnameInp.value;
    const jobtitle = jobtitleInp.value;
    const jobdescription = jobdescriptionInp.value;

    try {
        const res = await fetch("http://localhost:3000/api/jobs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstname, lastname, jobtitle, jobdescription })
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

