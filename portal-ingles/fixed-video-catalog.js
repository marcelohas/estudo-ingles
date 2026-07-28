// Fontes oficiais:
// Level 1: https://www.youtube.com/playlist?list=PLd9hCvj34W5it4a-RMzhlwNJ-edf5HU3Q
// Level 2: https://www.youtube.com/playlist?list=PLd9hCvj34W5hWkRym8sljiEvEBJ1JGIu5
const level1Ids = [
  "WR9_nsLyaEY","1-U7o9xjWQc","IEA9LMy-N3M","Z5PF-vJdUdc","lDaZB5BBw7M",
  "T3AJ29_2IX8","Ka33lX-kbMg","sp0cwcd1fGE","ZfdNbSe7Prw","1Lo_ICJYxZI",
  "8_npDNRKGIE","cyRaZA9ZD08","jkutq1P7AHU","4Xn1Ysdmuvg","c6_7RYaNgdA",
  "QQavoMYmMVE","91sCUUVTDV8","he12VfXp5Ec","lgEodUvA5Po","2juFXfLsSJk",
  "A9lwBqNZEh8","8Whu9xgm3dE","DzaLlp_kG6c","7BDjr0Oc6VM","bfRNAlZRiHg",
  "x2SQcTFvVzw","d_4TVWhqX4E","rn7kmGroxKs","_demyJmMyCo","xfMnWypEufs",
  "GnQEE0gEir0","1egFRwUFc48","GpiXMzf3FvY","qIiGG0pwzwk","6rFolPv2ntQ",
  "NXYXu9Kcb7o","AGYPb0eeIs8","oPEzfd7ZKQs","FpCQfJLD4K8","sHVX77yDQbs",
  "jCSHkjcmZvs","0aa78zW51so","KXo12U4kBeA","xCs62NwZr0k","P2ijn92tvn8",
  "5i95QZhOQfo","w-oq4RkEiDI","dfIPUcwcDP0","4z_TK18v2u8","SosJIruNC9Y",
  "R4SVqLFBhVY","qLH-_0ZJluU",
];

const level1Titles = [
  "Welcome!","Hello, I'm Anna!","I'm Here!","What Is It?","Where Are You?",
  "Where Is the Gym?","What Are You Doing?","Are You Busy?","Is It Cold?",
  "Come Over to My Place","This Is My Neighborhood","Meet My Family",
  "Happy Birthday, William Shakespeare!","How About This?","I Love People-Watching!",
  "Where Are You From?","Are You Free on Friday?","She Always Does That",
  "When Do I Start?","What Can You Do?","Can You Come to the Party?",
  "Next Summer...","What Do You Want?","Yesterday Was Amazing!","Watch Out!",
  "This Game Is Fun!","I Can't Come In","I Passed It!","A Long Time Ago",
  "Rolling on the River","Take Me Out to the Ball Game","Welcome to the Treehouse!",
  "Learning America's Sport","What Will I Do?","Let’s Make Dinner!","I Can Fix This!",
  "Let's Agree to Disagree","She's My Best Friend!","It’s Unbelievable!",
  "The Woods Are Alive","Teamwork Works Best With a Team",
  "I Was Minding My Own Business","Time for Plan B","Making Healthy Choices",
  "This Land is Your Land","May I Borrow That?","How Can I Help?",
  "Have You Ever ...?","Operation Spy!","Back to School","A Good Habit",
  "Taking Chances",
];

const level2Ids = [
  "4XaAE5NRHVM","xokbf-np33Q","a7X5ftOnp74","OR0d7fb_Ls0","yJ5fpEFx6j8",
  "5xdLrGkmbcg","x9MqYQYAGdA","WoJVDTaQQ5A","8aa3uD1Ywjc","O08F0xp1UGk",
  "DimMV7rUOhQ","VwoIWAsBQgM","sh-haAqZiy8","5fkai35hhVI","bUvWLxbXtkE",
  "0drJKfs3voQ","Ow8u0Zk2wV4","AMjUoPYXkdY","-e3XRPYy-ig","gTKvZSeqFsg",
  "Gn383Wyl0UQ","EOyRn0ajkgM","V_b9YReldOk","yjFq34vMMJQ","HTn-fhGncO0",
  "GX_YQGnTD0o","I3TgfC1Y8P4","uUl6WkwKNxs","Az3f5OQDtAw","hWgXavrZAXU",
];

const level2Titles = [
  "Budget Cuts","The Interview","He Said - She Said","Run Away With the Circus!",
  "Greatest Vacation of All Time","Will It Float?","Tip Your Tour Guide",
  "The Best Barbecue","Pets Are Family, Too!","Visit to Peru","The Big Snow",
  "Run! Bees!","Save the Bees!","Made for Each Other","Before and After",
  "Find Your Joy!","Flour Baby, Part 1","Flour Baby, Part 2","Movie Night",
  "The Test Drive","Trash to Treasure, Part 1","Trash to Treasure, Part 2",
  "Rock Star","I Feel Super!","Only Human","Look-alikes","Fish out of Water",
  "For the Birds","Where There's Smoke...","Dream a Little Dream",
];

const toCatalog = (ids, titles, phase, course, level) => ids.map((videoId, index) => ({
  videoId,
  title: `${course} · ${index + 1}. ${titles[index]}`,
  topic: titles[index],
  structures: `Conteúdo sequencial da aula ${index + 1} do curso ${course}.`,
  level,
  phase,
  order: index + 1,
  source: "VOA Learning English",
  verified: true,
}));

export const fixedVideoCatalog = [
  ...toCatalog(level1Ids, level1Titles, "A1-A2", "Let's Learn English Level 1", "A1-A2"),
  ...toCatalog(level2Ids, level2Titles, "A2-B1", "Let's Learn English Level 2", "A2-B1"),
];
