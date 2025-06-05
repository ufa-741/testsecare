import { supabase } from './supabase.js';

const container = document.querySelector(".coiffeur-list");

async function chargerCoiffeurs() {
  const { data, error } = await supabase
    .from("coiffeurs")
    .select("id, nom, prenom, photo_url, description");

  if (error) {
    console.error("Erreur chargement coiffeurs :", error);
    container.innerHTML = "<p>Erreur de chargement des coiffeurs.</p>";
    return;
  }

  container.innerHTML = ""; // Vide les coiffeurs codés en dur

  data.forEach(coiffeur => {
    const div = document.createElement("div");
    div.classList.add("coiffeur-card");

    const img = document.createElement("img");
    img.src = coiffeur.photo_url || "picture/default.jpg";
    img.alt = coiffeur.prenom;
    img.loading = "lazy";
    img.addEventListener("load", () => img.classList.add("loaded"));

    const h3 = document.createElement("h3");
    h3.textContent = `${coiffeur.prenom} ${coiffeur.nom}`;

    const p = document.createElement("p");
    p.textContent = coiffeur.description || "Aucune description";

    const button = document.createElement("button");
    button.textContent = "Choisir";
    button.setAttribute("data-id", coiffeur.id);

    button.addEventListener("click", () => {
      localStorage.setItem("selectedCoiffeurId", coiffeur.id);
      window.location.href = "reservation.html";
    });

    div.appendChild(img);
    div.appendChild(h3);
    div.appendChild(p);
    div.appendChild(button);

    container.appendChild(div);
  });
}

// ✅ Appelle la fonction une fois le DOM prêt
document.addEventListener("DOMContentLoaded", () => {
  chargerCoiffeurs();
});
