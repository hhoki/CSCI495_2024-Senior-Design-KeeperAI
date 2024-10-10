        const cardModal = document.getElementById('cardModal');
        const addBooksModal = document.getElementById('addBooksModal');

        // Separate modal elements for each modal
        const cardModalTitle = document.getElementById('cardModalTitle');
        const cardModalContent = document.getElementById('cardModalContent');
        const addBooksModalTitle = document.getElementById('addBooksModalTitle');
        const addBooksModalContent = document.getElementById('addBooksModalContent');
        
        // Separate close buttons for each modal
        const closeCardBtn = document.getElementById('closeCardModal');
        const closeAddBooksBtn = document.getElementById('closeAddBooksModal');


        function addCard() {
            const newCard = document.createElement('div');
            newCard.className = 'card';
            const cardNumber = cardGrid.children.length + 1;
            
            // Create the main content div
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            
            // Create the overlay div
            const overlay = document.createElement('div');
            overlay.className = 'card-overlay';
            overlay.innerHTML = `
                <h3>Book ${cardNumber}</h3>
                <p>Author: Example Author</p>
                <p>Rating: ★★★★☆</p>
            `;
            
            // Add content and overlay to the card
            newCard.appendChild(cardContent);
            newCard.appendChild(overlay);
            
            newCard.setAttribute('draggable', 'true');
            
            // Add event listeners
            newCard.addEventListener('dragstart', handleDragStart);
            newCard.addEventListener('dragend', handleDragEnd);
            newCard.addEventListener('dragenter', handleDragEnter);
            newCard.addEventListener('dragleave', handleDragLeave);
            
            // Modal click event
            newCard.addEventListener('click', function(e) {
                if (!this.classList.contains('dragging')) {
                    showModal(cardNumber);
                }
            });
            
            cardGrid.appendChild(newCard);
        }

        let draggedCard = null;
        let dropTarget = null;

        function handleDragStart(e) {
            draggedCard = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            draggedCard = null;
            
            // Remove all drop zone indicators
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('drop-left', 'drop-right');
            });
        }

        function handleDragEnter(e) {
            e.preventDefault();
            if (this !== draggedCard) {
                dropTarget = this;
            }
        }

        function handleDragLeave(e) {
            if (this === dropTarget) {
                dropTarget = null;
            }
        }

        cardGrid.addEventListener('dragover', function(e) {
            e.preventDefault();
            const cardBeingDraggedOver = e.target.closest('.card');
            
            if (cardBeingDraggedOver && cardBeingDraggedOver !== draggedCard) {
                const boundingRect = cardBeingDraggedOver.getBoundingClientRect();
                const offsetX = e.clientX - boundingRect.left;
                const width = boundingRect.width;
                
                // Remove previous indicators
                document.querySelectorAll('.card').forEach(card => {
                    card.classList.remove('drop-left', 'drop-right');
                });
                
                // Show drop zone indicator
                if (offsetX < width / 2) {
                    cardBeingDraggedOver.classList.add('drop-left');
                } else {
                    cardBeingDraggedOver.classList.add('drop-right');
                }
            }
        });

        cardGrid.addEventListener('drop', function(e) {
            e.preventDefault();
            const cardBeingDroppedOn = e.target.closest('.card');
            
            if (cardBeingDroppedOn && draggedCard !== cardBeingDroppedOn) {
                const boundingRect = cardBeingDroppedOn.getBoundingClientRect();
                const offsetX = e.clientX - boundingRect.left;
                const width = boundingRect.width;
                
                if (offsetX < width / 2) {
                    cardGrid.insertBefore(draggedCard, cardBeingDroppedOn);
                } else {
                    cardGrid.insertBefore(draggedCard, cardBeingDroppedOn.nextSibling);
                }
            }
        });

        function showModal(cardNumber) {
            cardModalTitle.textContent = 'Book ' + cardNumber;
            cardModalContent.innerHTML = `
                <p>This is additional information for Book ${cardNumber}.</p>
                <p>You can add any content here such as:</p>
                <ul>
                    <li>Detailed description</li>
                    <li>Images</li>
                    <li>Links</li>
                    <li>Any other relevant information</li>
                </ul>
            `;
            cardModal.style.display = 'block';
            // Trigger reflow to ensure animation plays
            void cardModal.offsetWidth;
            cardModal.classList.add('show');
        }

        function showAddBooksModal() {
            addBooksModalTitle.textContent = 'Upload Photo of Books to Add';
            // Still need to do more here.
            addBooksModalContent.innerHTML = `
                <p>Here you can add new books to your collection.</p>
                <form action="/action_page.php">
                    <label for="img">Select image:</label>
                    <input type="file" id="img" name="img" accept="image/*">

                </form>
                <form>
                    <label for="img">Select model:</label>
                    <select name="model">
                    
                        <option value="Gemini">Gemini 1.5 Flash</option>
                    </select>
                </form>
                <form>
                    <label for="img">Select shelf:</label>
                    <select name="model">
                    
                        <option value="shelf1">Shelf 1</option>
                    </select>
                </form>
            `;
            addBooksModal.style.display = 'block';
            // Trigger reflow to ensure animation plays
            void addBooksModal.offsetWidth;
            addBooksModal.classList.add('show');
        }
        
        function closeModal(modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Match this to CSS transition time
        }

        // Modal close functionality
        closeCardBtn.onclick = () => closeModal(cardModal);
        closeAddBooksBtn.onclick = () => closeModal(addBooksModal);


        // Close modals when clicking outside
        window.onclick = function(event) {
            if (event.target == cardModal) {
                cardModal.style.display = 'none';
            }
            if (event.target == addBooksModal) {
                addBooksModal.style.display = 'none';
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const dropdowns = document.querySelectorAll('.dropdown');
            
            dropdowns.forEach(dropdown => {
                const button = dropdown.querySelector('.dropbtn');
                const content = dropdown.querySelector('.dropdown-content');
                
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // Close all other dropdowns immediately
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.querySelector('.dropbtn').classList.remove('active');
                            otherDropdown.querySelector('.dropdown-content').classList.remove('show');
                        }
                    });
                    
                    // Toggle current dropdown
                    button.classList.toggle('active');
                    content.classList.toggle('show');
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                dropdowns.forEach(dropdown => {
                    if (!dropdown.contains(e.target)) {
                        const button = dropdown.querySelector('.dropbtn');
                        const content = dropdown.querySelector('.dropdown-content');
                        
                        if (content.classList.contains('show')) {
                            button.classList.remove('active');
                            content.classList.remove('show');
                        }
                    }
                });
            });
        });



        // Add initial cards
        for (let i = 0; i < 24; i++) {
            addCard();
        }