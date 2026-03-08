export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log('Starting Cloudinary upload for:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'pleasure');

    fetch(`https://api.cloudinary.com/v1_1/dgrgqnrkv/image/upload`, {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      console.log('Cloudinary response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Cloudinary response:', data);
      if (data.error) {
        console.error('Cloudinary upload error:', data.error);
        reject(new Error(data.error.message || 'Cloudinary upload failed'));
      } else {
        console.log('Cloudinary upload successful:', data.secure_url);
        resolve(data.secure_url);
      }
    })
    .catch(error => {
      console.error('Cloudinary fetch error:', error);
      reject(error);
    });
  });
};
