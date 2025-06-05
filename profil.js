import { supabase } from './supabase.js';

const inputNom = document.getElementById('nom');
const inputPrenom = document.getElementById('prenom');
const inputDescription = document.getElementById('description');
const inputPhoto = document.getElementById('photo');
const btnValider = document.getElementById('valider-profil');
const previewPhoto = document.getElementById('preview-photo');

let userId = '';
let photo_url = '';

// ✅ Chargement automatique du profil existant
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    alert("🔒 Vous devez être connecté.");
    window.location.href = "login.html";
    return;
  }

  userId = session.user.id;

  const { data: coiffeur, error: fetchError } = await supabase
    .from('coiffeurs')
    .select('nom, prenom, description, photo_url')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Erreur chargement profil :", fetchError.message);
    alert("Erreur lors du chargement du profil.");
    return;
  }

  if (coiffeur) {
    inputNom.value = coiffeur.nom || '';
    inputPrenom.value = coiffeur.prenom || '';
    inputDescription.value = coiffeur.description || '';
    previewPhoto.src = coiffeur.photo_url || 'picture/default.jpg';
    photo_url = coiffeur.photo_url || '';
  }
});

// 🖼️ Prévisualisation instantanée de la nouvelle photo
inputPhoto.addEventListener('change', () => {
  const file = inputPhoto.files[0];
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert("❌ Le fichier doit être une image.");
      inputPhoto.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("❌ L’image ne doit pas dépasser 2 Mo.");
      inputPhoto.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    previewPhoto.src = url;
  }
});

// 📝 Enregistrement ou mise à jour du profil
btnValider.addEventListener('click', async (e) => {
  e.preventDefault();

  const nom = inputNom.value.trim();
  const prenom = inputPrenom.value.trim();
  const description = inputDescription.value.trim();
  const file = inputPhoto.files[0];

  if (!prenom || !nom || !description) {
    alert("⚠️ Merci de remplir tous les champs.");
    return;
  }

  // 📤 Upload nouvelle photo si sélectionnée
  if (file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Erreur upload image :', uploadError.message);
      alert('❌ Une erreur est survenue lors de l’upload de la photo.');
      return;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(data.path);

    photo_url = publicUrlData.publicUrl;
  }

  console.log("💾 Données envoyées à Supabase :", {
    id: userId,          // Ajouté pour éviter erreur "id null"
    user_id: userId,
    nom,
    prenom,
    description,
    photo_url
  });

  // ✅ Correction ici : on fournit aussi `id` pour éviter l’erreur
  const { error: upsertError } = await supabase
    .from('coiffeurs')
    .upsert({
      id: userId,           // 👈 ceci est la clé du correctif
      user_id: userId,
      nom,
      prenom,
      description,
      photo_url
    }, { onConflict: ['user_id'] });

  if (upsertError) {
    console.error("❌ Erreur BDD :", upsertError.message);
    alert("❌ Une erreur est survenue lors de l'enregistrement.");
  } else {
    alert("✅ Profil mis à jour avec succès !");
    window.location.href = "planningcoiffeur.html";
  }
});
