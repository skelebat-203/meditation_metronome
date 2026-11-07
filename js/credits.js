'use strict';

// Asset credits shown on the Credits screen. Mirrors ATTRIBUTION.md: when an asset is added,
// replaced or removed there, update the matching entry here.

const CREDITS = Object.freeze([
  Object.freeze({
    heading: 'Music',
    items: Object.freeze([
      { title: 'Earth Prelude', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Earth_Prelude_(MacLeod,_Kevin', license: 'CC BY 3.0 US (modified: re-encoded, faded, trimmed)' },
      { title: 'Healing', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Healing_(Kevin_MacLeod', license: 'CC BY 3.0 US (modified: re-encoded, faded, trimmed)' },
      { title: 'Meditation Impromptu 01', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_01_-_Meditation_Impromptu_01.ogg', license: 'CC BY 3.0 (modified: re-encoded, faded, trimmed)' },
      { title: 'Meditation Impromptu 02', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_02_-_Meditation_Impromptu_02.ogg', license: 'CC BY 3.0 (modified: re-encoded, faded, trimmed)' },
      { title: 'Meditation Impromptu 03', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_03_-_Meditation_Impromptu_03.ogg', license: 'CC BY 3.0 (modified: re-encoded, faded, trimmed)' },
      { title: 'Bathed in the Light', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_Bathed_in_the_Light.ogg', license: 'CC BY 3.0 (modified: re-encoded, faded)' },
      { title: 'Calmant', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_Calmant.ogg', license: 'CC BY 3.0 (modified: re-encoded, faded, trimmed)' },
      { title: 'Inner Light', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_Inner_Light.ogg', license: 'CC BY 3.0 (modified: re-encoded, faded, trimmed)' },
      { title: 'Winter Reflections', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_Winter_Reflections.ogg', license: 'CC BY 3.0 (modified: re-encoded, faded)' },
      { title: 'Peaceful Desolation', author: 'Kevin MacLeod (incompetech.com)', source: 'https://commons.wikimedia.org/wiki/File:Peaceful_Desolation_(Kevin_MacLeod', license: 'CC BY 3.0 US (modified: re-encoded, faded)' },
    ]),
  }),
  Object.freeze({
    heading: 'Images',
    items: Object.freeze([
      { title: 'Beech and ferns in Gullmarsskogen', author: 'W.carter', source: 'https://commons.wikimedia.org/wiki/File:Beech_and_ferns_in_Gullmarsskogen.jpg', license: 'CC0' },
      { title: 'Birchwood Slavnoe 2012 G1', author: 'George Chernilevsky', source: 'https://commons.wikimedia.org/wiki/File:Birchwood_Slavnoe_2012_G1.jpg', license: 'Public domain' },
      { title: 'Bois Raquet, in the High Fens – Eifel Nature Park (DSCF6655)', author: 'Trougnouf (Benoit Brummer)', source: 'https://commons.wikimedia.org/wiki/File:Bois_Raquet,_in_the_High_Fens_%E2%80%93_Eifel_Nature_Park_(DSCF6655', license: 'CC BY 4.0 (modified: resized, converted to WebP)' },
      { title: 'Calm Bliss (195063633)', author: 'Michael D Beckwith', source: 'https://commons.wikimedia.org/wiki/File:Calm_Bliss_(195063633', license: 'CC0' },
      { title: 'Misty morning-Chugach-SAO-013 (52502228147)', author: 'Forest Service Alaska Region, USDA', source: 'https://commons.wikimedia.org/wiki/File:Misty_morning-Chugach-SAO-013_(52502228147', license: 'Public domain' },
      { title: 'Rogue-Umpqua Scenic Byway - Clearwater Falls on a Bright October Day - NARA - 7721356', author: 'Unknown author (U.S. Forest Service; via U.S. National Archives)', source: 'https://commons.wikimedia.org/wiki/File:Rogue-Umpqua_Scenic_Byway_-_Clearwater_Falls_on_a_Bright_October_Day_-_NARA_-_7721356.jpg', license: 'Public domain' },
      { title: 'Duke Forest misty morning h', author: 'Dcrjsr', source: 'https://commons.wikimedia.org/wiki/File:Duke_Forest_misty_morning_h.jpg', license: 'CC BY 3.0 (modified: resized, converted to WebP)' },
      { title: 'Engaku-ji zen garden, facing east', author: 'DimiTalen', source: 'https://commons.wikimedia.org/wiki/File:Engaku-ji_zen_garden,_facing_east.jpg', license: 'CC0' },
      { title: 'Zen garden and maples Koyasan temple', author: 'Lianguanlun', source: 'https://commons.wikimedia.org/wiki/File:Zen_garden_and_maples_Koyasan_temple.jpg', license: 'CC BY 4.0 (modified: resized, converted to WebP)' },
      { title: 'Lake Blanche Reflection (31122974596)', author: 'Intermountain Forest Service, USDA Region 4 Photography', source: 'https://commons.wikimedia.org/wiki/File:Lake_Blanche_Reflection_(31122974596', license: 'Public domain' },
      { title: 'Disappearing Peaks reflecting in Lake Gunn on a calm winter morning', author: 'Pseudopanax at English Wikipedia', source: 'https://commons.wikimedia.org/wiki/File:Disappearing_Peaks_reflecting_in_Lake_Gunn_on_a_calm_winter_morning.jpg', license: 'Public domain' },
      { title: 'Sunrise Reflections - Lake Louise, Alberta, Canada', author: 'TerryDOtt', source: 'https://commons.wikimedia.org/wiki/File:Sunrise_Reflections_-_Lake_Louise,_Alberta,_Canada.jpg', license: 'CC BY 2.0 (modified: resized, converted to WebP)' },
      { title: 'Nelumbo nucifera 33', author: 'Vengolis', source: 'https://commons.wikimedia.org/wiki/File:Nelumbo_nucifera_33.jpg', license: 'CC BY 4.0 (modified: resized, converted to WebP)' },
      { title: 'Nelumbo nucifera 5', author: 'Dinkum', source: 'https://commons.wikimedia.org/wiki/File:Nelumbo_nucifera_5.JPG', license: 'CC0' },
      { title: 'Marmaris Sunrise (228255025)', author: 'Alexey Shikov', source: 'https://commons.wikimedia.org/wiki/File:Marmaris_Sunrise_(228255025', license: 'CC0' },
      { title: 'Monte de Santa Tecla mountain reflected in the water of the river Minho during low tide, Caminha, Viana do Castelo, Portugal, January 2024 (53449790739)', author: 'Sergei Gussev', source: 'https://commons.wikimedia.org/wiki/File:Monte_de_Santa_Tecla_mountain_reflected_in_the_water_of_the_river_Minho_during_low_tide,_Caminha,_Viana_do_Castelo,_Portugal,_January_2024_(53449790739', license: 'CC BY 2.0 (modified: resized, converted to WebP)' },
      { title: 'Reflection Lake (253523161)', author: 'Dana Hutchinson', source: 'https://commons.wikimedia.org/wiki/File:Reflection_Lake_(253523161', license: 'CC BY 3.0 (modified: resized, converted to WebP)' },
      { title: 'Sunset at senggi beach', author: 'Bunikssitepu', source: 'https://commons.wikimedia.org/wiki/File:Sunset_at_senggi_beach.jpg', license: 'CC BY 4.0 (modified: resized, converted to WebP)' },
      { title: 'Spruce forest at Holma', author: 'W.carter', source: 'https://commons.wikimedia.org/wiki/File:Spruce_forest_at_Holma.jpg', license: 'CC0' },
      { title: 'Misty Winter morning in Stonor Forest (16170833916)', author: 'Scott Wylie from UK', source: 'https://commons.wikimedia.org/wiki/File:Misty_Winter_morning_in_Stonor_Forest_(16170833916', license: 'CC BY 2.0 (modified: resized, converted to WebP)' },
    ]),
  }),
]);
