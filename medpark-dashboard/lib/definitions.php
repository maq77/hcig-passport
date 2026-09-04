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
    /* ---- our own analytics ---------------------------------------------
       These come from our own tracking rather than Google, so the wording
       says what we measure and not what a Google help page says. */
    'live_active' => array(
        'label' => 'On the site now',
        'what'  => 'Different people seen in the last five minutes.',
        'why'   => 'No analytics can honestly say who is on a site right now, because a browser never announces that somebody left. This is the nearest honest version.',
        'good'  => 'Any number above zero during opening hours.',
    ),
    'live_today_visits' => array(
        'label' => 'Visits today',
        'what'  => 'Visits since midnight UTC.',
        'why'   => 'Google only publishes complete days, so today is a number only our own tracking can give you.',
        'good'  => 'Ahead of the same hour yesterday.',
    ),
    'live_today_visitors' => array(
        'label' => 'People today',
        'what'  => 'Different people today, rather than visits.',
        'why'   => 'Separates ten visits from one person off ten visits from ten people.',
        'good'  => 'Close to the visit count, which means new interest rather than repeat checking.',
    ),
    'live_today_enquiries' => array(
        'label' => 'Enquiries today',
        'what'  => 'Calls, WhatsApp messages, emails, forms and assistant leads today.',
        'why'   => 'The only number on this page that represents a patient.',
        'good'  => 'Above zero every day, and growing week on week.',
    ),
    'own_visitors' => array(
        'label' => 'Visitors',
        'what'  => 'People, rather than visits. Somebody who came three times counts once.',
        'why'   => 'Visits go up when the same people return. Visitors going up means the audience is growing.',
        'good'  => 'Rising month on month, and rising faster than visits during a campaign.',
    ),
    'own_conversions' => array(
        'label' => 'Enquiries',
        'what'  => 'Visits where somebody called, sent a WhatsApp message, emailed, submitted the form or gave the assistant their details.',
        'why'   => 'This is the closest thing to a patient that a website can produce.',
        'good'  => 'Growing month on month, and growing faster than visits.',
    ),
    'own_conv_rate' => array(
        'label' => 'Enquiry rate',
        'what'  => 'The share of visits that produced an enquiry.',
        'why'   => 'It separates a traffic problem from a website problem. More visits with a falling rate means the wrong people are arriving.',
        'good'  => 'Above 2% for an urgent care site. Below 1% means the contact options are hard to find.',
    ),
    /* WhatsApp. Its own page since 2026-09-03, because it is the channel this
       business actually runs on and it was one row in a table. */
    'wa_taps' => array(
        'label' => 'WhatsApp taps',
        'what'  => 'Every tap on a WhatsApp link anywhere on the website, in any language.',
        'why'   => 'For a hospital serving tourists this is the first contact more often than the phone is. It is free to receive and it is answered in writing, which suits somebody who does not speak the language.',
        'good'  => 'Growing month on month. A drop with visits flat means a button moved or broke.',
    ),
    'wa_visits' => array(
        'label' => 'Visits that used it',
        'what'  => 'The number of visits in which at least one WhatsApp tap happened.',
        'why'   => 'One worried person tapping four times is one enquiry, not four. This is the number to compare against visits.',
        'good'  => 'Close to the tap count. A large gap means people are tapping and coming back, which usually means the tap did not work.',
    ),
    'wa_rate' => array(
        'label' => 'Tap rate',
        'what'  => 'The share of all visits that produced a WhatsApp tap.',
        'why'   => 'It separates a traffic problem from a website problem. More visits with a falling rate means the wrong people are arriving, or the button got harder to find.',
        'good'  => 'Steady or rising. Judge it against the site enquiry rate on the Analysis page rather than against another business.',
    ),
    'wa_share' => array(
        'label' => 'Share of enquiries',
        'what'  => 'WhatsApp taps as a share of every enquiry: calls, WhatsApp, forms, emails and assistant leads together.',
        'why'   => 'It says how much of the enquiry flow depends on one channel. A channel carrying most of the business deserves most of the attention when it breaks.',
        'good'  => 'There is no right number. What matters is knowing it, and noticing when it moves.',
    ),
    /* Requests and contacts, the two halves of the Summary page. The
       distinction between them is the most important one in this dashboard,
       so both are defined rather than assumed. */
    'requests' => array(
        'label' => 'Appointment requests',
        'what'  => 'People who left a name and a number: the booking form on the website, and the assistant when a visitor gives their details.',
        'why'   => 'This is the closest thing a website produces to a patient. Somebody the team can ring back, not a tap that may have gone nowhere.',
        'good'  => 'Growing month on month, and every one of them answered.',
    ),
    'requests_form' => array(
        'label' => 'From the booking form',
        'what'  => 'Requests sent through the appointment form on the website.',
        'why'   => 'The form asks for what the team needs to call somebody back: name, number, hospital, and what they want.',
        'good'  => 'Rising as a share of all requests. A form request is more complete than anything else here.',
    ),
    'requests_assistant' => array(
        'label' => 'From the assistant',
        'what'  => 'Requests captured by the website assistant during a conversation.',
        'why'   => 'These come from people who had a question first. They often would not have used a form at all.',
        'good'  => 'Any number above zero. It is capturing people the form was losing.',
    ),
    'requests_waiting' => array(
        'label' => 'Waiting for a reply',
        'what'  => 'Requests still marked new, from any date, not just the selected period.',
        'why'   => 'A request nobody has answered is worse than one that never arrived, because the person is expecting a call.',
        'good'  => 'Zero. Anything else is somebody waiting.',
    ),
    'contacts' => array(
        'label' => 'Contact attempts',
        'what'  => 'Every press of a way to reach us: a phone number, a WhatsApp button, an email link, a submitted form.',
        'why'   => 'It measures intent at the moment it happens, including everyone who never fills in a form.',
        'good'  => 'Growing, and growing faster than visits. Read it next to requests: attempts are real but unfinished.',
    ),
    'contact_rate' => array(
        'label' => 'Contact rate',
        'what'  => 'The share of visits where somebody pressed a way of reaching us.',
        'why'   => 'It separates a traffic problem from a website problem. More visits with a falling rate means the wrong people are arriving, or the buttons got harder to find.',
        'good'  => 'Above 2% for an urgent care site. Below 1% means the contact options are hard to find.',
    ),
    'request_rate' => array(
        'label' => 'Request rate',
        'what'  => 'The share of visits that ended with somebody leaving their name and number.',
        'why'   => 'The hardest number on the page to move and the most valuable. It says how much of the traffic turns into somebody the team can actually call.',
        'good'  => 'Rising. It is normally far smaller than the contact rate, and that gap is the opportunity.',
    ),
    'own_pageviews' => array(
        'label' => 'Pages viewed',
        'what'  => 'Every page opened, across every visit.',
        'why'   => 'With visits beside it, it says whether people explore the site or leave from where they landed.',
        'good'  => 'Two or more pages per visit.',
    ),
    'own_engaged' => array(
        'label' => 'Time on site',
        'what'  => 'Time the page was actually being read: the tab in front of the visitor, and something done in the last thirty seconds.',
        'why'   => 'Google Analytics counts a page left open in a background tab. This does not, so the number is honest and usually lower.',
        'good'  => 'Above 45 seconds for an information page.',
    ),
    'own_pages_per' => array(
        'label' => 'Pages per visit',
        'what'  => 'How many pages the average visit opened.',
        'why'   => 'One page per visit means people are not finding a reason to go further.',
        'good'  => 'Above 1.8.',
    ),
    'own_bounce' => array(
        'label' => 'Left immediately',
        'what'  => 'Visits that opened one page, did nothing on it, and stayed under fifteen seconds.',
        'why'   => 'A stricter definition than Google uses. Somebody who read one page for two minutes and then called is not counted here, because that visit worked.',
        'good'  => 'Below 55%. Falling is better.',
    ),
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
