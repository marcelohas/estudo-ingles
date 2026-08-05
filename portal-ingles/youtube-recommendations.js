export const youtubeRecommendations = {
  courses: [
    { name: "BBC Learning English", url: "https://www.youtube.com/@bbclearningenglish" },
    { name: "Oxford Online English", url: "https://www.youtube.com/@Oxfordonlineenglish1" },
    { name: "Learn English with Let’s Talk", url: "https://www.youtube.com/@learnex" },
    { name: "Learn English with TV Series", url: "https://www.youtube.com/@LearnEnglishWithTVSeries" },
    { name: "Learn English with EnglishClass101", url: "https://www.youtube.com/@EnglishClass101" }
  ],
  professors: [
    { name: "mmmEnglish", url: "https://www.youtube.com/@mmmEnglish_Emma" },
    { name: "Rachel’s English", url: "https://www.youtube.com/@rachelsenglish" },
    { name: "English with Lucy", url: "https://www.youtube.com/@EnglishwithLucy" },
    { name: "English with James", url: "https://www.youtube.com/@engvidJames" },
    { name: "Speak English With Vanessa", url: "https://www.youtube.com/@SpeakEnglishWithVanessa" }
  ],
  corporate: [
    { name: "Derek Callan", url: "https://www.youtube.com/@DerekCallanEnglish" },
    { name: "linguamarina", url: "https://www.youtube.com/@linguamarina" },
    { name: "Business English Pod", url: "https://www.youtube.com/@BusinessEnglishPod" },
    { name: "Business English Learning", url: "https://www.youtube.com/@BusinessEnglishLearning" },
    { name: "Business English with Christina", url: "https://www.youtube.com/@BusinessEnglishWithChristina" }
  ],
  levels: {
    A1: { url: "http://lnkd.in/ddXKHB9g", name: "A1 – Iniciante" },
    A2: { url: "http://lnkd.in/d9t9-zke", name: "A2 – Básico" },
    B1: { url: "http://lnkd.in/dmr5pFRj", name: "B1 – Intermediário" },
    B2: { url: "http://lnkd.in/drcqbvpz", name: "B2 – Intermediário superior" },
    C1: { url: "http://lnkd.in/dinsgHt2", name: "C1 – Avançado" },
    C2: { url: "http://lnkd.in/daVvMx9X", name: "C2 – Proficiente" }
  }
};

export function getRecommendationsForSkill(skill, level) {
  let recommendations = [];
  
  if (skill === 'listening') {
    recommendations.push({ title: "Pratique escuta com séries e filmes", link: youtubeRecommendations.courses[3] });
    recommendations.push({ title: "Aulas completas de escuta da BBC", link: youtubeRecommendations.courses[0] });
  } else if (skill === 'vocabulary') {
    recommendations.push({ title: "Expanda seu vocabulário com Lucy", link: youtubeRecommendations.professors[2] });
    recommendations.push({ title: "Aprenda frases do dia a dia", link: youtubeRecommendations.courses[4] });
  } else if (skill === 'grammar') {
    recommendations.push({ title: "Gramática explicada por mmmEnglish", link: youtubeRecommendations.professors[0] });
    recommendations.push({ title: "Regras do inglês com James", link: youtubeRecommendations.professors[3] });
  } else if (skill === 'speaking') {
    recommendations.push({ title: "Pratique pronúncia com Rachel", link: youtubeRecommendations.professors[1] });
    recommendations.push({ title: "Fale inglês com Vanessa", link: youtubeRecommendations.professors[4] });
  } else if (skill === 'reading' || skill === 'writing') {
    recommendations.push({ title: "Aulas da Oxford Online English", link: youtubeRecommendations.courses[1] });
  }

  const levelInfo = youtubeRecommendations.levels[level];
  if (levelInfo) {
    recommendations.push({ title: `Aulas organizadas para o seu nível (${level})`, link: levelInfo });
  }

  return recommendations;
}
