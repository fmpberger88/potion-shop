function showPreview(event) {
    const input = event.target;
    const reader = new FileReader();

    reader.onload = function() {
        const preview = document.getElementById('preview');
        preview.src = reader.result;
        preview.style.display = 'block';
        document.getElementById('removeButton').style.display = 'block';
        document.getElementById('fileName').textContent = input.files[0].name;
    };

    reader.readAsDataURL(input.files[0]);
}

function removeImage() {
    const input = document.getElementById('image');
    const preview = document.getElementById('preview');
    const removeButton = document.getElementById('removeButton');
    const fileName = document.getElementById('fileName');

    input.value = '';
    preview.src = '#';
    preview.style.display = 'none';
    removeButton.style.display = 'none';
    fileName.textContent = '';
}
