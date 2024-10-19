        const cardModal = document.getElementById('cardModal');
        const addBookModal = document.getElementById('addBookModal');
        const addShelfModal = document.getElementById('addShelfModal');

        // Separate modal elements for each modal
        const cardModalTitle = document.getElementById('cardModalTitle');
        const cardModalContent = document.getElementById('cardModalContent');
        const addBookModalTitle = document.getElementById('addBookModalTitle');
        const addBookModalContent = document.getElementById('addBookModalContent');
        const addShelfModalTitle = document.getElementById('addShelfModalTitle');
        const addShelfModalContent = document.getElementById('addShelfModalContent');

        // Separate close buttons for each modal
        const closeCardBtn = document.getElementById('closeCardModal');
        const closeAddBookBtn = document.getElementById('closeAddBookModal');
        const closeAddShelfBtn = document.getElementById('closeAddShelfModal');


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
            void cardModal.offsetWidth;
            cardModal.classList.add('show');
        }
        
        function showAddBookModal() {
            addBookModalTitle.textContent = 'Upload Photo of Books to Add';
            addBookModalContent.innerHTML = `
                <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" id="fileInput" name="file" accept="image/*" required />
                <button type="submit">Upload</button>
                </form>
                <p id="resultMessage"></p>
            `;
            addBookModal.style.display = 'block';
            void addBookModal.offsetWidth;
            addBookModal.classList.add('show');
            
            initializeFormHandler();
        }

        // Function to render shelves in the side navbar
        function renderShelves(shelves) {
            const sideNavbar = document.getElementById('myNavbar');
            sideNavbar.innerHTML = ''; // Clear existing content
            
            // Add shelves
            shelves.forEach(shelf => {
            const shelfButton = document.createElement('button');
            shelfButton.textContent = shelf.shelf_name;
            shelfButton.onclick = () => loadBooksForShelf(shelf.shelf_id);
            sideNavbar.appendChild(shelfButton);
            });
            
            // Always add "New Shelf" button at the end
            const newShelfButton = document.createElement('button');
            newShelfButton.textContent = '+';
            newShelfButton.id = 'addShelfButton'; // Add an ID for easy reference
            newShelfButton.onclick = showAddShelfModal;
            sideNavbar.appendChild(newShelfButton);
        }
        
        function showAddShelfModal() {
            addShelfModalTitle.textContent = 'Add Shelf to Library';
            addShelfModalContent.innerHTML = `
                <form id="addShelfForm">
                    <label for="shelfName">Shelf Name:</label>
                    <input type="text" id="shelfName" required>
                    <label for="shelfDescription">Description:</label>
                    <textarea id="shelfDescription"></textarea>
                    <button type="submit">Add Shelf</button>
                </form>
            `;
            addShelfModal.style.display = 'block';
            void addShelfModal.offsetWidth;
            addShelfModal.classList.add('show');
            
            initializeAddShelfForm();
        }
    
        function initializeAddShelfForm() {
            const addShelfForm = document.getElementById('addShelfForm');
            if (addShelfForm) {
                addShelfForm.addEventListener('submit', addNewShelf);
            } else {
                console.error('Add shelf form not found');
            }
        }
    
        async function addNewShelf(event) {
            event.preventDefault();
            const shelfName = document.getElementById('shelfName').value;
            const shelfDescription = document.getElementById('shelfDescription').value;
            
            try {
                const response = await fetch('/shelf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ shelf_name: shelfName, shelf_description: shelfDescription }),
                });
                if (!response.ok) {
                    throw new Error('Failed to add new shelf');
                }
                const shelves = await fetchShelves();
                renderShelves(shelves);
                closeModal(addShelfModal);
            } catch (error) {
                console.error('Error adding new shelf:', error);
            }
        }
        
        function closeModal(modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Match this to CSS transition time
        }
        
        // Modal close functionality
        closeCardBtn.onclick = () => closeModal(cardModal);
        closeAddBookBtn.onclick = () => closeModal(addBookModal);
        closeAddBookBtn.onclick = () => closeModal(addShelfModal);
        
        // Close modals when clicking outside - with animation
        window.onclick = function(event) {
            if (event.target == cardModal) {
                closeModal(cardModal);
            }
            if (event.target == addBookModal) {
                closeModal(addBookModal);
            }
            if (event.target == addShelfModal) {
                closeModal(addShelfModal);
            }
        }
        
        function initializeFormHandler() {
            document.getElementById('uploadForm').addEventListener('submit', async function(event) {
                event.preventDefault();
                
                const fileInput = document.getElementById('fileInput');
                if (!fileInput.files[0]) {
                    alert('Please select a file to upload.');
                    return;
                }
            
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
            
                try {
                    const response = await fetch('/book/upload', {
                        method: 'POST',
                        body: formData
                    });
            
                    if (!response.ok) {
                        throw new Error(`Server error: ${response.status} ${response.statusText}`);
                    }
            
                    const result = await response.json();
                    document.getElementById('resultMessage').textContent = result.result || 'No books detected in the image.';
                } catch (error) {
                    console.error('Error uploading file:', error);
                    document.getElementById('resultMessage').textContent = `Error: ${error.message}`;
                }
            });
        }

        document.addEventListener('DOMContentLoaded', async () => {
            console.log('DOMContentLoaded event fired');
            try {
            const shelves = await fetchShelves();
            console.log('Fetched shelves:', shelves);
            renderShelves(shelves);
            
            // Set up event listener for add shelf form
            const addShelfForm = document.getElementById('addShelfForm');
            if (addShelfForm) {
            addShelfForm.addEventListener('submit', addNewShelf);
            console.log('Add shelf form event listener set up');
            } else {
            console.error('Add shelf form not found');
            }
            
            // Verify that the "+" button is added and set up event listener
            const addShelfButton = document.getElementById('addShelfButton');
            if (addShelfButton) {
            console.log('"+" button found in the DOM');
            addShelfButton.addEventListener('click', showAddShelfModal);
            console.log('"+" button click event listener set up');
            } else {
            console.error('"+" button not found in the DOM');
            }
            
            // Verify modal exists
            const modal = document.getElementById('addShelfModal');
            if (modal) {
            console.log('Modal element found in the DOM');
            } else {
            console.error('Modal element not found in the DOM');
            }
        } catch (error) {
            console.error('Error initializing shelves:', error);
        }
        const dropdowns = document.querySelectorAll('.dropdown');
        if (dropdowns.length > 0) {
            initializeDropdowns(dropdowns);
        }
        });


        function initializeDropdowns(dropdowns) {
            dropdowns.forEach(dropdown => {
                const button = dropdown.querySelector('.dropbtn');
                const content = dropdown.querySelector('.dropdown-content');
                
                if (button && content) {
                    button.addEventListener('click', function(e) {
                        e.stopPropagation();
                        
                        // Close all other dropdowns
                        dropdowns.forEach(otherDropdown => {
                            if (otherDropdown !== dropdown) {
                                const otherButton = otherDropdown.querySelector('.dropbtn');
                                const otherContent = otherDropdown.querySelector('.dropdown-content');
                                if (otherButton && otherContent) {
                                    otherButton.classList.remove('active');
                                    otherContent.classList.remove('show');
                                }
                            }
                        });
                        
                        // Toggle current dropdown
                        button.classList.toggle('active');
                        content.classList.toggle('show');
                    });
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                dropdowns.forEach(dropdown => {
                    if (!dropdown.contains(e.target)) {
                        const button = dropdown.querySelector('.dropbtn');
                        const content = dropdown.querySelector('.dropdown-content');
                        if (button && content && content.classList.contains('show')) {
                            button.classList.remove('active');
                            content.classList.remove('show');
                        }
                    }
                });
            });
        }

        // Add initial cards
        for (let i = 0; i < 24; i++) {
            addCard();
        }