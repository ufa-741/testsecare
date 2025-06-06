import { supabase } from './supabase.js';

const container = document.querySelector(".coiffeur-list");

function getOptimizedImage(url) {
  return url?.includes("supabase.co")
    ? `${url}?width=150&quality=70&format=webp`
    : "picture/default.jpg";
}

function preloadImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

async function chargerCoiffeurs() {
  const { data, error } = await supabase
    .from("coiffeurs")
    .select("id, nom, prenom, photo_url, description");

  if (error) {
    container.innerHTML = "<p>Erreur de chargement.</p>";
    return;
  }

  container.innerHTML = "";

  for (const { id, nom, prenom, photo_url, description } of data) {
    const imgUrl = getOptimizedImage(photo_url);
    const imgElement = await preloadImage(imgUrl);

    const card = document.createElement("div");
    card.className = "coiffeur-card";

    card.innerHTML = `
      <img src="${imgElement?.src || 'picture/default.jpg'}" alt="${prenom}" width="120" height="120" />
      <h3>${prenom} ${nom}</h3>
      <p>${description || "Aucune description"}</p>
      <button data-id="${id}">Choisir</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      localStorage.setItem("selectedCoiffeurId", id);
      window.location.href = "reservation.html";
    });

    container.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", chargerCoiffeurs);
