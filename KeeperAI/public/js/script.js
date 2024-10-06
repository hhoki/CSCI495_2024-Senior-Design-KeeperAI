function addButton() {
    const navbar = document.getElementById('myNavbar');
    const newButton = document.createElement('button');
    const buttonText = prompt('Enter button text:');
    if (buttonText) {
        newButton.textContent = buttonText;
        newButton.onclick = function() { removeButton(this); };
        navbar.insertBefore(newButton, document.getElementById('addButton'));
    }
}

function removeButton(button) {
    if (confirm('Are you sure you want to remove this button?')) {
        button.remove();
    }
}

function addCard() {
    const grid = document.getElementById('cardGrid');
    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.textContent = 'Card ' + (grid.children.length + 1);
    grid.appendChild(newCard);
}

// Add initial cards
for (let i = 0; i < 12; i++) {
    addCard();
}