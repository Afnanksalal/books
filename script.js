// GitHub repository information
const githubRepo = 'https://raw.githubusercontent.com/Afnanksalal/books/main/books/';
const githubApiUrl = 'https://api.github.com/repos/Afnanksalal/books/contents/books';

// PDF files list
let pdfFiles = [];
let filteredPdfFiles = [];
let currentPdf = null;

// DOM Elements
const dropdownContent = document.getElementById('dropdown-content');
const searchInput = document.getElementById('search-input');
const pdfIframe = document.getElementById('pdf-iframe'); // The iframe element
const controlsBar = document.getElementById('controls-bar');
const pdfNameDisplay = document.getElementById('pdf-name');
const errorMessage = document.getElementById('error-message');
const noResultsMessage = document.querySelector('.no-results');
const loadingFilesMessage = document.querySelector('.loading-files');
const welcomeScreen = document.getElementById('welcome-screen');
const pdfContainerWrapper = document.getElementById('pdf-container-wrapper');

// Fetch PDF files from GitHub repository
async function fetchPdfFiles() {
  try {
    loadingFilesMessage.style.display = 'block';
    noResultsMessage.style.display = 'none';
    // Clear previous file list
    const existingButtons = dropdownContent.querySelectorAll('a');
    existingButtons.forEach(button => button.remove());

    const response = await fetch(githubApiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch repository contents: ${response.statusText}`);
    }

    const data = await response.json();
    pdfFiles = data
      .filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        name: file.name,
        path: file.path,
        download_url: file.download_url,
        displayName: file.name.replace('.pdf', '')
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    filteredPdfFiles = [...pdfFiles];
    createPdfButtons(pdfFiles);
    loadingFilesMessage.style.display = 'none';
  } catch (error) {
    console.error('Error fetching PDF files:', error);
    loadingFilesMessage.textContent = 'Failed to load files. Please try again later.';
    loadingFilesMessage.style.color = 'red'; // Indicate error visually
    // Optionally show an error message on the page if file fetching fails
    showError('Could not load the list of PDFs.');
  }
}

// Create buttons for each PDF file
function createPdfButtons(files) {
  // Clear existing buttons, but keep loading/no-results messages
  const existingButtons = dropdownContent.querySelectorAll('a');
  existingButtons.forEach(button => button.remove());

  if (files.length === 0) {
    noResultsMessage.style.display = 'block';
    return;
  }

  noResultsMessage.style.display = 'none';

  files.forEach(file => {
    const linkElement = document.createElement('a');
    linkElement.href = '#';
    linkElement.innerHTML = `<i class="fas fa-file-pdf"></i> ${file.displayName}`;
    linkElement.setAttribute('data-pdf', file.download_url);
    linkElement.setAttribute('role', 'menuitem');
    linkElement.onclick = (e) => {
      e.preventDefault();
      loadPdf(file.download_url, file.name);
      toggleDropdown();
    };
    dropdownContent.appendChild(linkElement);
  });
}

// Load PDF file using Google Docs Viewer in an iframe
function loadPdf(pdfUrl, fileName) {
  // Construct the Google Docs viewer URL
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  // Hide previous errors
  hideError();

  // Hide welcome screen and show iframe
  welcomeScreen.style.display = 'none';
  pdfIframe.style.display = 'block';

  // Update current PDF
  currentPdf = { url: pdfUrl, name: fileName };

  // Update PDF name in controls bar
  pdfNameDisplay.textContent = fileName;
  controlsBar.style.display = 'flex';

  // Update download button (still links to the original file)
  const downloadButton = document.getElementById('download-button');
  downloadButton.onclick = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = fileName;
    a.target = '_blank';
    a.click();
  };

  // Set the iframe source to the viewer URL
  pdfIframe.src = viewerUrl;

  // Note: With no spinner, the user will just see a blank iframe until the viewer loads.
  // This is the tradeoff for simplicity.
}

// Helper functions for error states (loading removed)
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  welcomeScreen.style.display = 'flex'; // Show welcome screen on error
  pdfIframe.style.display = 'none'; // Hide iframe on error
  controlsBar.style.display = 'none'; // Hide controls on error
}

function hideError() {
  errorMessage.style.display = 'none';
}

// Toggle dropdown visibility
function toggleDropdown() {
  const dropdownButton = document.querySelector('.dropdown-button');
  const isExpanded = dropdownContent.style.display === 'block';

  dropdownContent.style.display = isExpanded ? 'none' : 'block';
  dropdownButton.setAttribute('aria-expanded', !isExpanded);
}

// Toggle fullscreen for the iframe
function toggleFullscreen() {
  const elem = pdfIframe; // Target the iframe for fullscreen

  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      elem.msExitFullscreen(); // Fixed a typo here: should be elem, not document
    }
  }
}

// Search functionality
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();

  if (searchTerm === '') {
    filteredPdfFiles = [...pdfFiles];
  } else {
    filteredPdfFiles = pdfFiles.filter(file =>
      file.displayName.toLowerCase().includes(searchTerm)
    );
  }

  createPdfButtons(filteredPdfFiles);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Fetch PDFs when page loads
  fetchPdfFiles();

  // Set up search input
  searchInput.addEventListener('input', handleSearch);

  // Set up fullscreen button
  const fullscreenButton = document.getElementById('fullscreen-button');
  fullscreenButton.addEventListener('click', toggleFullscreen);

  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown');
    const isClickInside = dropdown.contains(event.target);

    if (!isClickInside && dropdownContent.style.display === 'block') {
      toggleDropdown();
    }
  });

  // Enable keyboard navigation
  document.addEventListener('keydown', function(event) {
    const dropdownButton = document.querySelector('.dropdown-button');

    if (event.key === 'Escape') {
      if (dropdownContent.style.display === 'block') {
        toggleDropdown();
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }

    // Handle dropdown button activation with Enter key
    if (event.key === 'Enter' && document.activeElement === dropdownButton) {
        event.preventDefault();
        toggleDropdown();
    }

    // Handle selection from dropdown with Enter key
     if (event.key === 'Enter' && document.activeElement && document.activeElement.parentElement === dropdownContent) {
         event.preventDefault();
         document.activeElement.click();
     }
  });

  // Handle fullscreen change (for the iframe)
  document.addEventListener('fullscreenchange', function() {
    const fullscreenButton = document.getElementById('fullscreen-button');
    // The fullscreen element will be the iframe if it's in fullscreen
    if (document.fullscreenElement === pdfIframe ||
        document.mozFullScreenElement === pdfIframe ||
        document.webkitFullscreenElement === pdfIframe ||
        document.msFullscreenElement === pdfIframe) {
      fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
    }
  });

 // Accessibility: Allow navigation within dropdown with arrow keys
 dropdownContent.addEventListener('keydown', function(event) {
    const links = Array.from(dropdownContent.querySelectorAll('a'));
    const activeElement = document.activeElement;
    const currentIndex = links.indexOf(activeElement);

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (currentIndex < links.length - 1) {
            links[currentIndex + 1].focus();
        } else {
            links[0].focus();
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (currentIndex > 0) {
            links[currentIndex - 1].focus();
        } else {
            links[links.length - 1].focus();
        }
    }
 });

   // Initial state: show welcome screen and hide iframe
   welcomeScreen.style.display = 'flex';
   pdfIframe.style.display = 'none';
   controlsBar.style.display = 'none';
});
