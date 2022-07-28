import axios from "axios";

const uploadPic = async (media) => {
  try {
    const form = new FormData();
    form.append("file", media);
    form.append("upload_preset", "wee-connect");
    form.append("cloud_name", "bacale");

    const res = await axios.post(process.env.CLOUDINARY_URL, form);

    return res.data.url;
  } catch (error) {
    console.log(error);
  }
};

export default uploadPic;
