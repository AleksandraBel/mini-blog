export const uploadImageToCloudinary = async (file) => {
  const url = `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error?.message || "Помилка при завантаженні зображення"
      );
    }

    return data.secure_url;
  } catch (error) {
    console.error("Upload error:", error.message);
    throw error;
  }
};
