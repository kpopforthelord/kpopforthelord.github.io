// First, we select important elements and initialize the Fabric.js canvas
const imageLoader = document.getElementById('imageLoader');
const canvas = new fabric.Canvas('imageCanvas', {
  width: 750,
  height: 1050,
  backgroundColor: null // Ensures the canvas has a transparent background
});

// Handle the image upload process
// Utilizes the FileReader API to read the file, creates a new Image instance, 
// and adds it to the canvas as a Fabric.js Image instance
imageLoader.addEventListener('change', e => {
  const reader = new FileReader();
  
  reader.onload = event => {
    const img = new Image();
    
    img.onload = () => {
      const imgInstance = new fabric.Image(img, {
        left: 0,
        top: 0,
        angle: 0,
        cornerSize: 10
      });

      canvas.add(imgInstance);
      canvas.setActiveObject(imgInstance);
    };
    
    img.src = event.target.result;
  };

  reader.readAsDataURL(e.target.files[0]);
});

// Switch between dark mode and light mode
// Simply toggles the 'dark-mode' class on the body element
document.getElementById('darkMode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Handle the download button click
// Sets default name and tag values if they are empty, creates a filename,
// and triggers the canvas download process
document.getElementById('download').addEventListener('click', () => {
  const name = document.getElementById('name').value || 'defaultName';
  const tags = document.getElementById('tags').value || 'defaultTag';
  const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
  const filename = `${name}_${tags}_${timestamp}.png`;
  
  downloadCanvas(filename);
});

// Download canvas as an image with rounded corners
// First, the main canvas is converted to a data URL. Then, a secondary canvas 
// is created with the same size as the image, a rounded rectangle path is drawn,
// the image is drawn from the main canvas, and the secondary canvas is converted 
// to a data URL. Finally, a download link is created, clicked, and removed.
function downloadCanvas(filename) {
  const dataUrl = canvas.toDataURL({format: 'png'});

  const img = new Image();
  
  img.onload = () => {
    const secondaryCanvas = document.createElement('canvas');
    secondaryCanvas.width = img.width;
    secondaryCanvas.height = img.height;
    
    const ctx = secondaryCanvas.getContext('2d');
    const radius = 30; // Adjust this to change the roundness of corners

    // Draw a rounded rectangle path
    drawRoundedRectangle(ctx, img.width, img.height, radius);

    // Draw the image from the main canvas
    ctx.drawImage(img, 0, 0);

    const roundedDataUrl = secondaryCanvas.toDataURL({format: 'png'});
    triggerDownload(roundedDataUrl, filename);
  };

  img.src = dataUrl;
}

// Draws a rounded rectangle on a canvas context
function drawRoundedRectangle(ctx, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, height - radius);
  ctx.quadraticCurveTo(width, height, width - radius, height);
  ctx.lineTo(radius, height);
  ctx.quadraticCurveTo(0, height, 0, height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  
  ctx.clip();
}

// Creates a temporary download link for the file, simulates a click to start
// the download, and then removes the link from the document
function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  addToBinder(url);
}

// Add zooming functionality to the canvas
canvas.on('mouse:wheel', opt => {
  let zoom = canvas.getZoom();
  zoom *= 0.999 ** opt.e.deltaY;
  
  zoom = Math.max(0.01, Math.min(zoom, 20)); // Clamp zoom between 0.01 and 20
  canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

  opt.e.preventDefault();
  opt.e.stopPropagation();

  updateImageSizeDisplay(zoom);
});

// Update the displayed image size when zooming
function updateImageSizeDisplay(zoom) {
  const activeObject = canvas.getActiveObject();
  
  if (activeObject) {
    document.getElementById('imageSize').innerText = 
      `Image size: ${Math.round(activeObject.getScaledWidth() * zoom)}x${Math.round(activeObject.getScaledHeight() * zoom)}`;
  }
}

// Add the image to the binder element
function addToBinder(dataUrl) {
  const binder = document.getElementById('binder');
  const img = createThumbnail(dataUrl);
  
  img.addEventListener('click', () => {
    openInNewTab(dataUrl);
  });

  binder.appendChild(img);
}

// Creates a thumbnail image element
function createThumbnail(dataUrl) {
  const img = document.createElement('img');
  img.src = dataUrl;
  img.width = 250; // Set the width of the thumbnail
  img.height = 350; // Set the height of the thumbnail
  img.classList.add('thumbnail'); // Optional: add a class for styling
  
  return img;
}

// Opens the image in a new tab
function openInNewTab(dataUrl) {
  const binary = atob(dataUrl.split(',')[1]);
  const array = Array.from(binary, char => char.charCodeAt(0));
  const blob = new Blob([new Uint8Array(array)], {type: 'image/png'});
  
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500,height=700');
  win.focus();
}

// Handle multiple image uploads to the binder
document.getElementById('loadCards').addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    const reader = new FileReader();
    
    reader.onload = event => {
      addToBinder(event.target.result);
    };
    
    reader.readAsDataURL(file);
  });
});

document.addEventListener('paste', function(event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function(event) {
                console.log(event.target.result); // this will output a base64 encoded string of the image data
                // You can use this data to create a new Image and then add it to your canvas
                var img = new Image();
                img.onload = function() {
                    const imgInstance = new fabric.Image(img, {
                        left: 0,
                        top: 0,
                        angle: 0,
                        cornerSize: 10
                    });

                    canvas.add(imgInstance);
                    canvas.setActiveObject(imgInstance);
                };
                img.src = event.target.result;
            }; // data url
            reader.readAsDataURL(blob);
        }
    }
});
  
document.getElementById('exportBinder').addEventListener('click', () => {
  const binder = document.getElementById('binder');
  const collageDiv = document.createElement('div');
  collageDiv.style.display = 'flex';
  
  // Get all images in the binder
  const images = binder.getElementsByTagName('img');
  
  // Create a copy of each thumbnail in the binder and append it to the new div
  for (let img of images) {
    const imgCopy = img.cloneNode(true);
    collageDiv.appendChild(imgCopy);
  }
  
  // Add the div to the body (it's not displayed, so it won't affect the page layout)
  document.body.appendChild(collageDiv);
  
  // Use html2canvas to create a canvas from the div
  html2canvas(collageDiv, {
    width: collageDiv.scrollWidth,
    height: 361
  }).then(tempCanvas => {
    // Create a new canvas and context for the final image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // Set the canvas dimensions
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    // Draw the rounded rectangle and clip the context
    drawRoundedRectangle(ctx, canvas.width, canvas.height, 15); // 15 is the radius
    // Draw the image (the collage) inside the clipped context
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

    const collageUrl = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = collageUrl;
    link.download = 'binder_collage.png';
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up - remove the div from the body
    document.body.removeChild(collageDiv);
  });
});

// Add drag and drop sorting functionality to the binder
new Sortable(binder, {
  animation: 150,
  ghostClass: 'blue-background-class',
});
