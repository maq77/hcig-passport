<?php
/* ==========================================================================
   Metric definitions.

   The audit found 8 cards on the CEO overview and 0 explanations. A number
   with nothing next to it is a number nobody trusts, and an executive who
   does not trust a number stops opening the dashboard.

   Every metric is defined once here and reused in three places: the tooltip
   on screen, the caption under the tile, and the glossary in the exported
   report. One definition, so the PDF can never disagree with the screen.

   Three fields, always in this order:
     what  - in plain words, no jargon, no metric names
     why   - tied to patients, not to marketing
     good  - so the reader knows whether to be pleased
   ========================================================================== */
declare(strict_types=1);

function mp_definitions(): array {
    return array(

    /* ---- the numbers a chief executive reads first -------------------- */
    'enquiries' => array(
        'label' => 'Enquiries',
        'what'  => 'Everyone who contacted us through the website: tapped the phone number, opened WhatsApp, sent the contact form, or asked the website assistant for an appointment.',
        'why'   => 'This is the closest thing to a patient that a website can produce. Every other number on this page only matters because it feeds this one.',
        'good'  => 'Growing month on month. The absolute number depends on season, so the direction matters more than the size.',
    ),
    'calls' => array(
        'label' => 'Calls',
        'what'  => 'Taps on a phone number anywhere on the site, counted separately for each language.',
        'why'   => 'For urgent care this is the strongest signal of intent there is. Somebody with a problem picked up the phone.',
        'good'  => 'Rising, and rising faster than sessions. If sessions grow and calls do not, the site is attracting the wrong visitors.',
    ),
    'whatsapp' => array(
        'label' => 'WhatsApp',
        'what'  => 'Taps that opened a WhatsApp conversation with us.',
        'why'   => 'Tourists avoid international call charges, so many prefer WhatsApp. In some months it will outperform calls entirely.',
        'good'  => 'Rising. A sharp fall usually means a broken link rather than falling demand, so it is worth checking quickly.',
    ),
    'assistant' => array(
        'label' => 'Assistant requests',
        'what'  => 'Appointment requests captured by the website assistant, each with a name and a telephone number.',
        'why'   => 'These arrive with details attached, so staff can call back rather than wait. Nothing is confirmed to the patient automatically.',
        'good'  => 'Any number above zero is new business the site was not capturing before.',
    ),
    'enquiry_rate' => array(
        'label' => 'Enquiry rate',
        'what'  => 'The share of visitors who contacted us in any way.',
        'why'   => 'It separates a traffic problem from a website problem. Rising visits with a flat rate means people arrive and leave without acting.',
        'good'  => 'Above 2% for an urgent care site. Under 1% usually means the phone number is not visible without scrolling on a phone.',
    ),

    /* ---- reach --------------------------------------------------------- */
    'sessions' => array(
        'label' => 'Visits',
        'what'  => 'How many times someone opened the website. One person visiting twice counts twice.',
        'why'   => 'Useful only alongside the enquiry rate. Traffic on its own does not pay for anything.',
        'good'  => 'Growing, provided the enquiry rate holds. Growth with a falling rate is not progress.',
    ),
    'impressions' => array(
        'label' => 'Found on Google',
        'what'  => 'How many times a MedPark page appeared in Google search results, whether or not anyone clicked.',
        'why'   => 'It shows whether Google considers us relevant at all. It moves before clicks do, so it is the earliest sign that search work is landing.',
        'good'  => 'Rising steadily. A sudden fall means a ranking or an indexing problem.',
    ),
    'clicks' => array(
        'label' => 'Clicks from Google',
        'what'  => 'People who saw us in search results and chose us.',
        'why'   => 'Traffic we do not pay for. Unlike advertising it compounds, and it does not stop when a budget stops.',
        'good'  => 'Rising, and rising in step with impressions. If impressions grow and clicks do not, our titles are the problem.',
    ),
    'position' => array(
        'label' => 'Average position',
        'what'  => 'Where we typically appear in Google results. Lower is better: 1 is the top of the page.',
        'why'   => 'Positions 1 to 3 take most of the clicks. Below 10 is page two, where almost nobody looks.',
        'good'  => 'Falling towards 1. Moving from 6 to 3 roughly doubles the clicks for that term.',
    ),

    /* ---- local --------------------------------------------------------- */
    'map_calls' => array(
        'label' => 'Calls from Maps',
        'what'  => 'People who called us straight from the Google Maps listing, without ever opening the website.',
        'why'   => 'A tourist with a problem searches Maps, not a website. This demand is completely invisible in website analytics.',
        'good'  => 'Often larger than website calls. If it is not, the listings need attention before the site does.',
    ),
    'directions' => array(
        'label' => 'Direction requests',
        'what'  => 'People who asked Maps how to reach one of the branches.',
        'why'   => 'The closest thing to somebody physically arriving. They are not researching, they are coming.',
        'good'  => 'Rising. This is the number most worth reporting to a board, because it is the hardest to argue with.',
    ),

    /* ---- technical and AI ---------------------------------------------- */
    'speed' => array(
        'label' => 'Mobile speed',
        'what'  => 'Google\'s score out of 100 for how fast the site loads on a phone.',
        'why'   => 'Most visitors are on a phone on hotel wifi. A slow first load loses them before they read a word, and Google ranks slow sites lower.',
        'good'  => '90 or above is good, 50 to 89 needs work, below 50 is costing us visitors today.',
    ),
    'ai_mentions' => array(
        'label' => 'AI mentions',
        'what'  => 'Out of a fixed set of patient questions, how often ChatGPT and similar tools name MedPark in the answer.',
        'why'   => 'A growing share of travellers ask an assistant before they search. If we are not named there, we are invisible to them entirely.',
        'good'  => 'Rising. The question set stays fixed so the months compare honestly.',
    ),
    'cost_per_enquiry' => array(
        'label' => 'Cost per enquiry',
        'what'  => 'Advertising spend divided by the enquiries it produced.',
        'why'   => 'The number that decides whether to spend more or less. Everything else is context for this one.',
        'good'  => 'Falling. It cannot be calculated until advertising accounts are connected.',
    ),
    );
}

function mp_def(string $key): ?array {
    $d = mp_definitions();
    return isset($d[$key]) ? $d[$key] : null;
}

/* The tooltip text, as one string. Used in a title attribute and in the
   report glossary, so both always say the same thing. */
function mp_def_text(string $key): string {
    $d = mp_def($key);
    if (!$d) return '';
    return $d['what'] . "\n\nWhy it matters: " . $d['why'] . "\n\nWhat good looks like: " . $d['good'];
}
