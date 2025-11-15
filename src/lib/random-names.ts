
const adjectives = [
  'Agile', 'Amber', 'Azure', 'Bold', 'Brave', 'Bright', 'Bronze', 'Calm', 'Clever', 'Cool',
  'Crimson', 'Crystal', 'Cyber', 'Dandy', 'Dapper', 'Daring', 'Dark', 'Dauntless', 'Deft',
  'Diamond', 'Digital', 'Electric', 'Elegant', 'Emerald', 'Fancy', 'Fast', 'Fearless', 'Flying',
  'Frosty', 'Gentle', 'Ghost', 'Giant', 'Gilded', 'Glass', 'Glitch', 'Golden', 'Grand', 'Graphite',
  'Green', 'Grey', 'Happy', 'Hidden', 'Humble', 'Hyper', 'Ice', 'Imperial', 'Jade', 'Jolly', 'Jumping',
  'Keen', 'Lazy', 'Lightning', 'Little', 'Lucky', 'Lunar', 'Majestic', 'Mega', 'Midnight', 'Mighty',
  'Mystic', 'Noble', 'Obsidian', 'Omega', 'Onyx', 'Orange', 'Pearl', 'Pink', 'Pixel', 'Plain', 'Prime',
  'Proud', 'Purple', 'Quantum', 'Quartz', 'Quick', 'Quiet', 'Quirky', 'Rainbow', 'Rapid', 'Regal',
  'Retro', 'Rogue', 'Royal', 'Ruby', 'Sapphire', 'Savage', 'Scarlet', 'Secret', 'Shadow', 'Shiny',
  'Silent', 'Silk', 'Silver', 'Sly', 'Small', 'Smart', 'Solar', 'Solid', 'Sonic', 'Spicy', 'Spirit',
  'Stealth', 'Steel', 'Storm', 'Stray', 'Super', 'Swift', 'Thunder', 'Titan', 'Topaz', 'Turbo', 'Twilight',
  'Ultra', 'Valiant', 'Velvet', 'Vibrant', 'Violet', 'Virtual', 'Wandering', 'White', 'Wild', 'Wise', 'Yellow',
  'Zany', 'Zenith', 'Zephyr',
];

const animals = [
  'Alpaca', 'Ant', 'Antelope', 'Ape', 'Armadillo', 'Axolotl', 'Badger', 'Barracuda', 'Bat', 'Bear',
  'Beaver', 'Bee', 'Bison', 'Bobcat', 'Buffalo', 'Butterfly', 'Camel', 'Capybara', 'Caribou', 'Cassowary',
  'Cat', 'Caterpillar', 'Cheetah', 'Chicken', 'Chinchilla', 'Clam', 'Cobra', 'Condor', 'Cougar',
  'Coyote', 'Crab', 'Crane', 'Cricket', 'Crocodile', 'Crow', 'Deer', 'Dingo', 'Dodo', 'Dog', 'Dolphin',
  'Donkey', 'Dragon', 'Dragonfly', 'Duck', 'Eagle', 'Echidna', 'Eel', 'Elephant', 'Elk', 'Emu', 'Falcon',
  'Ferret', 'Finch', 'Firefly', 'Fish', 'Flamingo', 'Flea', 'Fly', 'Fox', 'Frog', 'Gazelle', 'Gecko',
  'Gerbil', 'Gibbon', 'Giraffe', 'Gnat', 'Gnu', 'Goat', 'Goldfinch', 'Goldfish', 'Goose', 'Gorilla',
  'Grasshopper', 'Grizzly', 'Grouse', 'Guanaco', 'Gull', 'Hamster', 'Hare', 'Hawk', 'Hedgehog',
  'Heron', 'Herring', 'Hippo', 'Hornet', 'Horse', 'Hummingbird', 'Hyena', 'Ibis', 'Iguana', 'Impala',
  'Jackal', 'Jaguar', 'Jay', 'Jellyfish', 'Kangaroo', 'Kingfisher', 'Koala', 'Kookaburra', 'Kudu',
  'Ladybug', 'Lapwing', 'Lark', 'Lemur', 'Leopard', 'Lion', 'Llama', 'Lobster', 'Locust', 'Loris',
  'Louse', 'Lynx', 'Lyrebird', 'Macaw', 'Magpie', 'Mallard', 'Manatee', 'Mandrill', 'Mantis', 'Marlin',
  'Marmot', 'Meerkat', 'Mink', 'Mole', 'Mongoose', 'Monkey', 'Moose', 'Mosquito', 'Moth', 'Mouse',
  'Mule', 'Narwhal', 'Newt', 'Nightingale', 'Octopus', 'Okapi', 'Opossum', 'Oryx', 'Ostrich', 'Otter',
  'Owl', 'Ox', 'Oyster', 'Panda', 'Panther', 'Parrot', 'Partridge', 'Peafowl', 'Pelican', 'Penguin',
  'Pheasant', 'Pig', 'Pigeon', 'Platypus', 'Pony', 'Porcupine', 'Porpoise', 'Quail', 'Quelea', 'Quetzal',
  'Rabbit', 'Raccoon', 'Rail', 'Ram', 'Rat', 'Raven', 'Reindeer', 'Rhino', 'Roadrunner', 'Rook',
  'Salamander', 'Salmon', 'Sandpiper', 'Sardine', 'Scorpion', 'Seahorse', 'Seal', 'Shark', 'Sheep',
  'Shrew', 'Skunk', 'Snail', 'Snake', 'Sparrow', 'Spider', 'Squid', 'Squirrel', 'Starling', 'Stingray',
  'Stork', 'Swallow', 'Swan', 'Tapir', 'Tarsier', 'Termite', 'Thrush', 'Tiger', 'Toad', 'Trout', 'Turkey',
  'Turtle', 'Viper', 'Vulture', 'Wallaby', 'Walrus', 'Wasp', 'Weasel', 'Whale', 'Wildcat', 'Wolf',
  'Wolverine', 'Wombat', 'Woodpecker', 'Worm', 'Wren', 'Yak', 'Zebra'
];

export function generateRandomName(): string {
  // This is safe to run on the client, as it's only for generating a name, not for security.
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective} ${animal}`;
}
