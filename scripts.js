// Function to load PDF files using PDFObject
function loadPdf(pdfFile) {
  const pdfContainer = document.getElementById('pdf-container');
  const loadingIndicator = document.getElementById('loading-indicator');

  // Show loading indicator
  loadingIndicator.style.display = 'block';

  PDFObject.embed(pdfFile, pdfContainer, {
    pdfOpenParams: { scrollbars: '1', toolbar: '0', statusbar: '0' }
  }).then(() => {
    // Hide loading indicator when PDF is loaded
    loadingIndicator.style.display = 'none';
  }).catch(() => {
    // Hide loading indicator and show error message
    loadingIndicator.style.display = 'none';
    alert('Failed to load PDF file.');
  });
}

// Function to dynamically create buttons
function createPdfButtons() {
  const dropdownContent = document.getElementById('dropdown-content');
  const githubRepo = 'https://raw.githubusercontent.com/Afnanksalal/books/main/books/'; // Adjust the URL to your GitHub repository

  // Hardcoded list of PDF files
  const pdfFiles = [
    'Dsa.pdf',
    'example2.pdf',
    'example3.pdf'
  ];

  pdfFiles.forEach(pdfFile => {
    const linkElement = document.createElement('a');
    linkElement.href = '#'; // Initially, redirect to '#' (no actual navigation)
    linkElement.textContent = pdfFile.replace('.pdf', '');
    linkElement.onclick = () => {
      loadPdf(githubRepo + pdfFile); // Load the PDF when the link is clicked
      toggleDropdown(); // Close the dropdown after selection
    };
    linkElement.setAttribute('role', 'menuitem');
    dropdownContent.appendChild(linkElement);
  });
}

// Function to toggle the dropdown visibility
function toggleDropdown() {
  const dropdownContent = document.getElementById('dropdown-content');
  const isExpanded = dropdownContent.style.display === 'block';
  dropdownContent.style.display = isExpanded ? 'none' : 'block';
  document.querySelector('.dropdown-button').setAttribute('aria-expanded', !isExpanded);
}

// Function to toggle fullscreen
function toggleFullscreen() {
  const elem = document.querySelector('.pdf-container');
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    elem.requestFullscreen();
  }
}

// Call the function to create buttons when the page loads
window.onload = createPdfButtons;

// Enable keyboard navigation
document.addEventListener('keydown', function(event) {
  const dropdownButton = document.querySelector('.dropdown-button');
  const dropdownContent = document.getElementById('dropdown-content');

  if (event.key === 'Escape' && dropdownContent.style.display === 'block') {
    toggleDropdown();
  }

  if (event.key === 'Enter' && document.activeElement === dropdownButton) {
    toggleDropdown();
  }
});
