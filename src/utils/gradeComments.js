// utils/gradeComments.js

/**
 * Génère un commentaire automatique en fonction de la note
 * @param {number} note - La note de l'élève (entre 0 et 20)
 * @param {string} subject - La matière (optionnel)
 * @returns {string} Le commentaire approprié
 */
export function generateGradeComment(note, subject = '') {
  if (note === null || note === undefined) {
    return 'Note non renseignée';
  }

  const matiere = subject ? `en ${subject}` : '';
  
  if (note >= 16 && note <= 20) {
    return `Excellente performance ${matiere} ! Travail remarquable et très appliqué. Continue comme ça !`;
  }
  
  if (note >= 14 && note < 16) {
    return `Très bon travail ${matiere}. Résultats solides et efforts constants.`;
  }
  
  if (note >= 12 && note < 14) {
    return `Bon travail ${matiere}. Quelques progrès encore possibles pour atteindre l'excellence.`;
  }
  
  if (note >= 10 && note < 12) {
    return `Résultats satisfaisants ${matiere}. Continue tes efforts pour progresser.`;
  }
  
  if (note >= 8 && note < 10) {
    return `Attention ${matiere}, des difficultés persistent. Il faut redoubler d'efforts.`;
  }
  
  if (note >= 5 && note < 8) {
    return `Résultats insuffisants ${matiere}. Un travail régulier et sérieux est nécessaire.`;
  }
  
  if (note >= 0 && note < 5) {
    return `Échec grave ${matiere}. Une remise à niveau urgente est indispensable.`;
  }
  
  return 'Note hors fourchette standard';
}