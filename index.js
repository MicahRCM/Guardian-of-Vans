let van = document.getElementById("van")
let creditScore = document.getElementById("creditScore")
let gameContainer = document.getElementById("gameContainer")
let keyState = {};

// Terrible variables
let credit = 0
let credit_change = -10
let lentils = []
let items = []
let ls = []
let van_speed = 5
let max_lentils = 20
let lentil_speed = 40
let time_start = performance.now()
let broke = false

// Listens for the keys to move crockpot side to side
window.addEventListener('keydown', function(e) {
    keyState[e.keyCode || e.which] = true;
}, true);
window.addEventListener('keyup', function(e) {
    keyState[e.keyCode || e.which] = false;
}, true);

// Frequently used random number generator
const getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Hacky javascript game loop
let frame = 0
x = 100;
const gameLoop = () => {
    // Left keypress absolute position left
    if (keyState[37]) {
        x -= van_speed;
    }
    // Right keypress absolute position right
    if (keyState[39]) {
        x += van_speed;
    }
    frame++
    // Generates falling lentils
    makeLentils()
    // Makes items appear sometimes
    spawnItem()
    x = checkRange(x)
    van.style.left = x
    // Recursion
    setTimeout(gameLoop, 1);
}

// Makes sure crockpot is within range of game
const checkRange = (x) => {
    if (x < 10) {
        return 10
    } else if (x > 780) {
        return 780
    } else {
        return x
    }
}

// Makes lentil making decisions
const makeLentils = () => {
    // Stops the game if player drops too many lentils
    if (credit < 0) {
        bankrupt()
    }
    // Increases lentil speed every 1000 frames
    if (frame % 1000 == 0) {
        lentil_speed = Math.ceil(lentil_speed / 1.2)
        credit_change -= 10
    }
    // Creates a new lentil
    if (frame % lentil_speed == 0) {
        let lentil = document.createElement("img")
        lentil.className = "lentil"
        lentil.setAttribute("src", "./assets/lentil.png")
        lentil.style.top = 0
        // Gets lentil position
        lentil.style.left = lentilStream()
        // Adds element to a global array
        lentils.push(lentil)
        // Adds element to game container
        document.getElementById("gameContainer").appendChild(lentil)
    }
    // Moves lentils along a y-axis
    rainLentils()
    // Checks if crockpot caught a lentil
    checkCollision()
}

// Generates a somewhat linear stream of lentils
const lentilStream = () => {
    // Generates a new stream every 15-25 lentils
    if (ls.length == 0) {
        ls.push(getRandom(10, 980))
        for (let i = 0; i < getRandom(15, 25); i++) {
            let last = ls[ls.length - 1]
            // Moves lentil right if too far left
            if (last < 121) {
                ls.push(last + 120)
                // Moves lentil left if too far right
            } else if (last > 859) {
                ls.push(last - 120)
                // Moves lentil to a valid location
            } else {
                ls.push(getRandom(last - 120, last + 120))
            }
        }
    }
    let num = ls[0]
    ls = ls.slice(1, ls.length)
    return num
}

// Moves lentils along y-axis
const rainLentils = () => {
    for (let i = 0; i < lentils.length; i++) {
        let top = parseInt(lentils[i].style.top)
        if (top > 880) {
            lentilDropper(lentils[i].style.left)
            removeLentil(lentils[i], i)
        } else {
            lentils[i].style.top = parseInt(lentils[i].style.top) + 3
        }
    }
}

// Checks if crockpot is overlapping with any other dom elements
const checkCollision = () => {
    let van = document.getElementById("van").getBoundingClientRect()
    // Checking for lentils
    for (let i = 0; i < lentils.length; i++) {
        let lentil = lentils[i].getBoundingClientRect()
        let overlap = !(van.right < lentil.left ||
            van.left > lentil.right ||
            van.bottom < lentil.top ||
            van.top > lentil.bottom)
        if (overlap) {
            // Removes lentil from DOM and global array
            removeLentil(lentils[i], i)
            // Gives one point
            creditScoreUp(1)
        }
    }
    // Checking for items
    for (let i = 0; i < items.length; i++) {
        let item = items[i].getBoundingClientRect()
        let overlap = !(van.right < item.left ||
            van.left > item.right ||
            van.bottom < item.top ||
            van.top > item.bottom)
        if (overlap) {
            activateItem(items[i].id)
            removeItem(items[i], i)
        }
    }
}

// Removes lentil from DOM and global array
const removeLentil = (lentil, i) => {
    lentil.parentNode.removeChild(lentil)
    lentils.splice(i, 1)
}

// Removes item from DOM and global array
const removeItem = (item, i) => {
    item.parentNode.removeChild(item)
    items.splice(i, 1)
}

// Brings credit score up or down by the amount passed 
const creditScoreUp = (up = 1) => {
    credit += up
    creditScore.innerHTML = "Credit Score: " + credit
}

// Spawns an item if randomly generated integer falls within given range 
const spawnItem = () => {
    let item = getRandom(1, 10000)
    // Van spawn
    if (item < 10000 && item > 9990 && lentil_speed > 0) {
        spawnVan()
    }
}

// Creates van and places it randomly on x-axis
const spawnVan = () => {
    let speedVan = document.createElement("img")
    speedVan.className = "item"
    speedVan.style.left = getRandom(50, 800)
    speedVan.id = "speedy"
    speedVan.setAttribute("src", "./assets/van.png")
    document.getElementById("gameContainer").appendChild(speedVan)
    items.push(speedVan)
}

// Use for items
const activateItem = (id) => {
    if (id == "speedy" && van_speed < 16) {
        van_speed++
    }
}

// Warning for missing lentils
const lentilDropper = (x) => {
    let poor = document.createElement("span")
    poor.className = "lentil-dropper"
    poor.innerHTML = credit_change + " Filthy Lentil Waster."
    poor.style.left = x
    gameContainer.appendChild(poor)
    creditScoreUp(credit_change)
    setTimeout(() => {
        poor.parentNode.removeChild(poor)
    }, 500)
}

// Ends the game
const bankrupt = () => {
    if (!broke) {
        broke = true
        lentil_speed = 0
        let time_end = performance.now()
        document.getElementById("bankrupt-results").innerHTML = "You lasted " + Math.floor((time_end - time_start) / 1000) + " seconds before going broke dropping your lentils."
        document.getElementById("bankrupt").style.display = "inherit"
    }

}
gameLoop();