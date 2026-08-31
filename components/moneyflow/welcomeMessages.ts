export type WelcomePeriod = "morning" | "afternoon" | "evening" | "lateNight";

export const welcomeMessages: Record<WelcomePeriod, string[]> = {
  morning: [
    "New day, fresh numbers — let’s give every dollar a direction.",
    "Your coffee can wait a minute. Your money has something to say.",
    "Good morning — small money moves make surprisingly strong mornings.",
    "The day is wide open. Let’s make your money feel organized before it gets busy.",
    "Morning check-in: future you is quietly cheering for today’s good choices.",
    "Rise, shine, and see where your dollars are headed.",
    "A clear money plan pairs nicely with breakfast.",
    "Your wallet woke up before your notifications did. Let’s check in.",
    "Today’s plot twist: your money actually has a plan.",
    "Fresh start unlocked — let’s turn intentions into numbers.",
    "Good morning — one honest look at your money can change the whole day.",
    "Before the day starts sprinting, let’s put your money in its lane.",
    "Your financial dashboard is awake. Your future self is taking notes.",
    "Morning momentum: know what is coming in, going out, and staying put.",
    "The first win of the day can be a two-minute money check.",
    "New sunlight, same goals — let’s move one of them forward.",
    "Your dollars are ready for their daily briefing.",
    "Start the day with clarity, not financial guesswork.",
    "Good morning — make today’s money decisions easier than yesterday’s.",
    "A little planning now beats a lot of wondering later.",
  ],
  afternoon: [
    "Midday money pit stop: are your dollars still following the route?",
    "The afternoon is a great time to catch a tiny leak before it becomes a puddle.",
    "Two minutes of money clarity can rescue the rest of your day.",
    "Your lunch break called. It wants a quick financial check-in.",
    "Afternoon checkpoint: spend on purpose, not on autopilot.",
    "Half the day is gone. Let’s make sure your money is going somewhere useful.",
    "A quick check now beats a dramatic spreadsheet session later.",
    "Your money is still working today. Let’s see how it is doing.",
    "Midday reminder: progress counts even when it looks like one small decision.",
    "The numbers are not judging you. They are giving you directions.",
    "Afternoon energy, but make it financially intentional.",
    "Pause the scroll — your future self requested a money status update.",
    "Today’s spending story is still being written. You hold the pen.",
    "A calmer month can start with one honest afternoon check.",
    "Your budget does not need perfection. It needs a quick hello.",
    "Midday mission: keep the useful, question the accidental.",
    "The best time to notice a money pattern is before it becomes a habit.",
    "Afternoon forecast: a strong chance of smarter spending.",
    "Your dollars have made it halfway through the day. Let’s check their itinerary.",
    "Small review, big relief — let’s see what changed since morning.",
  ],
  evening: [
    "Day’s winding down — let’s see what your money accomplished while you were busy.",
    "Evening review: close the day with clarity instead of financial suspense.",
    "Your future self loves a calm evening and a checked transaction list.",
    "The day is done enough for a quick money debrief.",
    "Evening mode: celebrate the wins, spot the patterns, adjust the plan.",
    "Your money story has a new chapter today. Let’s read the highlights.",
    "Before you call it a day, give your dollars a quick roll call.",
    "A peaceful evening starts with knowing what happened financially today.",
    "Tonight’s tiny habit: check in now, worry less later.",
    "Your spending has receipts. Your goals have opinions. Let’s hear both.",
    "Evening check: did your money support the life you were trying to live today?",
    "The day spent itself. Let’s make sure your money did not disappear with it.",
    "Wind down with a dashboard that tells the truth and helps you plan tomorrow.",
    "Today’s financial encore is a quick review and one useful next step.",
    "Good evening — your money deserves a little attention before the lights go out.",
    "The best end-of-day recap has fewer surprises and more useful answers.",
    "Your goals are still on stage. Let’s see how today moved the story along.",
    "Evening clarity: notice, learn, and let tomorrow start lighter.",
    "One calm check can turn a noisy money day into a useful lesson.",
    "Your financial day is almost closed. Let’s balance the books emotionally and literally.",
  ],
  lateNight: [
    "Still up? Let’s make tomorrow’s money feel lighter, not louder.",
    "Late-night finance club: fewer surprises, better mornings.",
    "The world is quiet. Perfect time for one tiny decision your future self will love.",
    "Before the last scroll, let’s send your money in the right direction.",
    "Night shift for your finances: review gently, plan simply, rest easier.",
    "Tomorrow has enough mysteries. Your money does not need to be one of them.",
    "A late-night check is useful. A late-night panic spiral is not. Keep it simple.",
    "Your goals are sleeping lightly. Give them one small reason to wake up proud.",
    "Quiet hours, clear numbers, lighter tomorrow.",
    "The spreadsheet goblins are off duty. Let’s make one smart move and call it a night.",
    "Late-night reminder: progress can be calm, boring, and still powerful.",
    "Your future morning self left a note: thanks for checking in tonight.",
    "No dramatic finance decisions required — just a little awareness before bed.",
    "The day is over, but your money habits are still writing the next one.",
    "Night owl mode: turn today’s numbers into tomorrow’s confidence.",
    "Your wallet is whispering, not shouting. Let’s listen for a minute.",
    "One small financial reset before sleep can make tomorrow feel more spacious.",
    "The late-night goal is not perfection. It is a softer landing tomorrow.",
    "Close the day with a plan your tired self can actually follow.",
    "Good night, money manager — future you has this receipt for your effort.",
  ],
};

export function getWelcomePeriod(hour: number): WelcomePeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "lateNight";
}

export function getWelcomeMessage(date: Date, name: string): string {
  const period = getWelcomePeriod(date.getHours());
  const messages = welcomeMessages[period];
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  const periodNumber = Math.floor(date.getHours() / 3);
  const message = messages[(dayNumber + periodNumber) % messages.length];
  return `${name} — ${message}`;
}
