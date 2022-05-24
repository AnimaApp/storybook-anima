export const uploadFile = async (url: string, file: Blob) => {
  let data = new FormData();

  data.append("name", "storybook_preview");
  data.append("file", file);

  return fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: data,
  });
};
