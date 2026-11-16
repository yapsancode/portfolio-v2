/** Short, authored lines. Topical references can be curated later without a live news dependency. */
export type DialogueEvent = "entrance" | "attack" | "finale" | "hurt" | "taunt" | "defeat";
export const DIALOGUE: Record<number, Record<DialogueEvent, readonly string[]>> = {
  1: {
    entrance: ["Earth sent a POINTER to rob me?", "This marble is not a free sample.", "Your mining permit has been denied."],
    attack: ["I am a monument. Show some respect.", "Earth can find its own rocks!", "You wanted marble? CATCH."],
    finale: ["Enough games. LOOK AT ME.", "My eye has had enough of you.", "Hold still. This is the dramatic part."],
    hurt: ["ARHHH! My good side!", "That belongs in a museum!", "Stop harvesting my greatness!"],
    taunt: ["Return to Earth. Empty-handed.", "Pointer not responding. How tragic.", "Your tiny ship needs a bigger plan."],
    defeat: ["Tell Earth I was magnificent.", "I was only a wallpaper...", "This is an unauthorized donation!"],
  },
  2: {
    entrance: ["Every piece of me wants you gone.", "Earth ordered marble? Express delivery!", "Meet my smaller opinions."],
    attack: ["I call this crowd support.", "A thousand tiny masterpieces!", "Your cargo hold looks hungry."],
    finale: ["Fine. I will do this BY HAND.", "Every piece of me, make a fist!", "Talk to the hand. The very large hand."],
    hurt: ["ARHHH! Stop shooting my children!", "Those fragments were limited editions!", "You are collecting ME?!"],
    taunt: ["Too much marble for one little ship?", "Delivery complete. Recipient flattened.", "Earth should have sent a bigger basket."],
    defeat: ["I have become a bulk discount.", "Every piece still deserves applause.", "Do not build a bathroom with me!"],
  },
  3: {
    entrance: ["Even my ego has an orbit.", "A halo. Finally, proper recognition.", "Your mining ship has entered sacred space."],
    attack: ["Admire the halo. From a distance.", "Try fitting your ego through that gap.", "Another ring of pure brilliance."],
    finale: ["A crown for me. A cage for you.", "The halo is closing. Bow or leave.", "Kneel inside my crown, little pointer."],
    hurt: ["That opening was NOT an invitation!", "ARHHH! You chipped perfection!", "My halo is not construction material!"],
    taunt: ["You missed the opening. Obviously.", "Earthlings never read the signs.", "That was a lesson in geometry."],
    defeat: ["The gap was a design choice!", "Earth had better polish these rings.", "My greatness was poorly contained."],
  },
  4: {
    entrance: ["Forecast: personal.", "Earth needs resources? Look up.", "I have arranged a marble shower."],
    attack: ["Still standing there? How convenient.", "I am changing your local weather.", "Cloudy with a chance of ME."],
    finale: ["I am dropping the entire forecast.", "Look up. That one has your name on it.", "The sky is falling. I pushed it."],
    hurt: ["ARHHH! Who approved this weather?", "Stop collecting my atmosphere!", "My forecast did not include pain."],
    taunt: ["Should have packed an umbrella.", "That ship is not weatherproof.", "Earth has rain. I have standards."],
    defeat: ["This was meant to be a light shower.", "Tell Earth the delivery was intentional.", "The forecast has been cancelled."],
  },
  5: {
    entrance: ["These are designer shields.", "My personal space has security.", "Earth cannot afford this finish."],
    attack: ["Admire the armour. Then duck.", "Removing the packaging. Violently.", "Security, escort this pointer out!"],
    finale: ["Full armour. No visitors.", "Find the gap. I dare you.", "This suit was made to explode."],
    hurt: ["MY ARMOUR! That was custom-made!", "You scratched the premium finish!", "ARHHH! The warranty excludes mining!"],
    taunt: ["That is what luxury feels like.", "Your ship failed the dress code.", "No refunds for Earth."],
    defeat: ["Keep the receipt. I am priceless.", "This is a very expensive salvage operation.", "At least recycle the packaging."],
  },
  6: {
    entrance: ["Eye contact is not optional.", "I can see your entire mining operation.", "Earth sent you. I will send you back."],
    attack: ["Missed? I was warming up.", "Look at me when I threaten you.", "Let us review that dodge."],
    finale: ["Both eyes on you now.", "Two beams. One tiny pointer.", "Let me see you twice as clearly."],
    hurt: ["ARHHH! Not the face lamp!", "You cannot mine my charisma!", "My vision is perfect. Your manners are not."],
    taunt: ["Now THAT is a glowing review.", "Your ship needs sunglasses.", "I saw that coming. You did not."],
    defeat: ["Tell Earth to dim the lights.", "My brilliance was misunderstood.", "This is not defeat. It is a power cut."],
  },
};

const priorities: Record<DialogueEvent, number> = { entrance: 3, attack: 1, finale: 3, hurt: 0, taunt: 2, defeat: 4 };
const previous = new Map<string, string>();

/** Uses simulation time: pause/rotation naturally freeze both expiry and cooldown. */
export function createDialogue(level: number, random = Math.random) {
  const pools = DIALOGUE[level] ?? DIALOGUE[1];
  const bags = new Map<DialogueEvent, string[]>();
  let current: { text: string; until: number; priority: number } | null = null;
  let nextChatter = 0;
  return {
    line(event: DialogueEvent, now: number): string | null {
      const priority = priorities[event];
      if (current && now < current.until && priority <= current.priority) return null;
      if (priority < 3 && now < nextChatter) return null;
      let bag = bags.get(event);
      const key = `${level}:${event}`;
      if (!bag?.length) {
        bag = [...pools[event]];
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        if (bag[bag.length - 1] === previous.get(key)) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
        bags.set(event, bag);
      }
      const text = bag.pop()!;
      previous.set(key, text);
      current = { text, until: now + 3.2, priority };
      nextChatter = now + 5;
      return text;
    },
    visible(now: number) { return current && now < current.until ? current.text : null; },
  };
}
