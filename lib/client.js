import sanityClient from "@sanity/client";

const client = sanityClient({
  projectId: "x1cv6403",
  dataset: "production",
  apiVersion: "v1",
  token:
    "skn6fc1fD0VCqaZ0NNhWFMh4toL8Xh9NVjYACMH3nJEJEaukRQ0h13qq3uwsHgmCwDmgLdY9sD1wmq6KuoCAXySjjG3tJKJ1r3QCSoK2pJk2VGcLmMKgodJhCZxTfoAez13xaBaiiJOaBbLgqtKLHubl3o8iDDKsp0vqBP8PvEG51Ug0En1o",
  useCdn: false,
});

export default client;
