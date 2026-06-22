import API_URL from "../config/api";

const getImageUrl = (image) => {
  if (!image) return "/no-image.png";

  if (image.startsWith("http")) {
    return image;
  }

  const cleanPath = image.replace(/^\/+/, "");

  return `${API_URL}/${cleanPath}`;
};

export default getImageUrl;
