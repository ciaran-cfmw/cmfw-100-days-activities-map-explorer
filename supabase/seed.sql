-- Seed file for activities and countries tables
-- Generated from src/data/activities.json and src/data/countries.json

-- Seed countries table
INSERT INTO countries (id, name, status, active_schools, total_pledges, highlights, body) VALUES
('Brazil', 'Brazil', 'Mobilizing', 156, 28124, 
 ARRAY['Community engagement initiatives', 'Educational outreach programs', 'Partnership with local organizations'],
 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

### Impact Goals

We aim to reach 50,000 students by the end of the year through our targeted school pledge programs.');

-- Seed activities table
INSERT INTO activities (slug, title, type, coordinates, description, day, image, body) VALUES
('kenya-kisii', 'Kisii County, Kenya', 'School Pledge', ARRAY[34.7667, -0.6817], 
 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness', 3,
 '/uploads/acr7754047293440140576.jpg',
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness

---

**Campaign Update**

Lorem ipsum dolor sit amet, consectetur adipiscing elit. This activity represents a significant milestone in our ongoing efforts to create lasting change in the community.'),

('sierra-leone-kossoh', 'Kossoh Town, Sierra Leone', 'Community Awareness', ARRAY[-13.2304, 8.484], 
 'Community Awareness initiatives in Kossoh town Community.', 3, NULL,
 '**Activity Snapshot:**
> Community Awareness initiatives in Kossoh town Community.'),

('nigeria-bayelsa', 'Bayelsa State, Nigeria', 'School Pledge', ARRAY[6.0699, 4.7719], 
 'School Pledge Events and Community Awareness campaigns.', 5, NULL,
 '**Activity Snapshot:**
> School Pledge Events and Community Awareness campaigns.'),

('ghana-mafi', 'Mafi Traditional Area, Ghana', 'School Pledge', ARRAY[0.4, 6.1333], 
 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness, Meeting a group of people during Christmas festivities.', 2, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('liberia-paynesville', 'Paynesville City, Liberia', 'School Pledge', ARRAY[-10.707, 6.224], 
 'School Pledge Events, Faith Leader Messages and Events, Community Awareness.', 7, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Community Awareness.'),

('malawi-chirimba', 'Chirimba, Malawi', 'School Pledge', ARRAY[34.98, -15.76], 
 'School Pledge Events and Community Awareness.', 4, NULL,
 '**Activity Snapshot:**
> School Pledge Events and Community Awareness.'),

('zimbabwe-lupane', 'Lupane District, Zimbabwe', 'School Pledge', ARRAY[27.807, -18.931], 
 'School Pledge Events across the district.', 9, NULL,
 '**Activity Snapshot:**
> School Pledge Events across the district.'),

('malawi-chozoli', 'Chozoli, Malawi', 'School Pledge', ARRAY[34.3, -13.25], 
 'School Pledge Events.', 6, NULL,
 '**Activity Snapshot:**
> School Pledge Events.'),

('zambia-sansamwenje', 'Sansamwenje, Zambia', 'School Pledge', ARRAY[31.5, -9.5], 
 'School Pledge Events, Faith Leader Messages and Events, Community Awareness.', 11, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Community Awareness.'),

('uganda-wakiso', 'Wakiso District, Uganda', 'Faith Leader Action', ARRAY[32.48, 0.395], 
 'Faith Leader Messages and Events, Community Awareness.', 8, NULL,
 '**Activity Snapshot:**
> Faith Leader Messages and Events, Community Awareness.'),

('uganda-mpigi', 'Mpigi, Budaka & Ibanda, Uganda', 'School Pledge', ARRAY[32.33, 0.23], 
 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Conferences.', 13, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Conferences.'),

('nigeria-jos', 'Jos South, Nigeria', 'School Pledge', ARRAY[8.86, 9.8], 
 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.', 10, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('malawi-sadulira', 'Sadulira Village, Malawi', 'School Pledge', ARRAY[33.8, -13.5], 
 'School Pledge Events and Community Awareness.', 12, NULL,
 '**Activity Snapshot:**
> School Pledge Events and Community Awareness.'),

('nigeria-farawa', 'Farawa, Nigeria', 'School Pledge', ARRAY[8.53, 11.96], 
 'School Pledge Events at Alkhairi Suya street.', 14, NULL,
 '**Activity Snapshot:**
> School Pledge Events at Alkhairi Suya street.'),

('uganda-kazindiro', 'Kazindiro, Uganda', 'Gov Engagement', ARRAY[29.95, -0.85], 
 'Engaging Local Officials /Decision Makers and Community Awareness.', 1, NULL,
 '**Activity Snapshot:**
> Engaging Local Officials /Decision Makers and Community Awareness.'),

('cameroon-bertoua', 'Bertoua-Belabo, Cameroon', 'School Pledge', ARRAY[13.5, 4.93], 
 'School Pledge Events, Faith Leader Messages and Events, Community Awareness.', 3, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Community Awareness.'),

('nigeria-nasarawa', 'Nasarawa State, Nigeria', 'School Pledge', ARRAY[8.19, 8.54], 
 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.', 5, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('uganda-avonu', 'Avonu Lower Village, Uganda', 'Community Awareness', ARRAY[32.6, 2.2], 
 'Community Awareness campaigns.', 2, NULL,
 '**Activity Snapshot:**
> Community Awareness campaigns.'),

('tanzania-pongwe', 'Pongwe-Tanga, Tanzania', 'Faith Leader Action', ARRAY[39.05, -5.13], 
 'Faith Leader Messages and Events.', 7, NULL,
 '**Activity Snapshot:**
> Faith Leader Messages and Events.'),

('zimbabwe-binga', 'Binga District, Zimbabwe', 'Faith Leader Action', ARRAY[27.34, -17.62], 
 'Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.', 4, NULL,
 '**Activity Snapshot:**
> Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('burundi-gihosha', 'Gihosha, Burundi', 'School Pledge', ARRAY[29.39, -3.36], 
 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.', 9, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('zambia-petauke', 'Petauke, Zambia', 'School Pledge', ARRAY[31.32, -14.24], 
 'School Pledge Events, Faith Leader Messages and Events, Community Awareness.', 6, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Community Awareness.'),

('zambia-bauleni', 'Bauleni Township, Zambia', 'Faith Leader Action', ARRAY[28.34, -15.44], 
 'Faith Leader Messages and Events, Community Awareness.', 11, NULL,
 '**Activity Snapshot:**
> Faith Leader Messages and Events, Community Awareness.'),

('kenya-bunyore', 'Bunyore Area, Kenya', 'Faith Leader Action', ARRAY[34.6, 0.1], 
 'Faith Leader Messages and Events.', 8, NULL,
 '**Activity Snapshot:**
> Faith Leader Messages and Events.'),

('togo-maritime', 'Région Maritime, Togo', 'School Pledge', ARRAY[1.2, 6.3], 
 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.', 13, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('tanzania-mwembesongo', 'Mwembesongo Ward, Tanzania', 'School Pledge', ARRAY[32.8, -5.01], 
 'School Pledge Events, Engaging Local Officials /Decision Makers.', 10, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Engaging Local Officials /Decision Makers.'),

('kenya-kakuma', 'Kakuma & Kalobeyei, Kenya', 'School Pledge', ARRAY[34.86, 3.71], 
 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.', 12, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('uganda-kyotera', 'Kyotera, Uganda', 'School Pledge', ARRAY[31.54, -0.63], 
 'School Pledge Events, Engaging Local Officials /Decision Makers, Community Awareness.', 14, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('zimbabwe-goromonzi', 'Goromonzi District, Zimbabwe', 'Community Awareness', ARRAY[31.38, -17.84], 
 'Community Awareness campaigns.', 2, NULL,
 '**Activity Snapshot:**
> Community Awareness campaigns.'),

('liberia-districts', 'District 7 & 8, Liberia', 'School Pledge', ARRAY[-10.8, 6.3], 
 'School Pledge Events, Community Awareness.', 4, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Community Awareness.'),

('nigeria-plateau', 'Plateau State, Nigeria', 'School Pledge', ARRAY[9.5, 9.2], 
 'School Pledge Events, Engaging Local Officials /Decision Makers, Community Awareness.', 6, NULL,
 '**Activity Snapshot:**
> School Pledge Events, Engaging Local Officials /Decision Makers, Community Awareness.'),

('niger-tchangarey', 'Tchangarey, Niger', 'Faith Leader Action', ARRAY[2.1, 13.51], 
 'Messages et événements des chefs religieux, Mobiliser les élus et décideurs locaux, Sensibilisation de la communauté.', 8, NULL,
 '**Activity Snapshot:**
> Messages et événements des chefs religieux, Mobiliser les élus et décideurs locaux, Sensibilisation de la communauté.'),

('drc-nord-kivu', 'Nord-Kivu, DRC', 'School Pledge', ARRAY[29, -1], 
 'Événements d''engagement scolaire, Messages et événements des chefs religieux, Sensibilisation de la communauté.', 10, NULL,
 '**Activity Snapshot:**
> Événements d''engagement scolaire, Messages et événements des chefs religieux, Sensibilisation de la communauté.'),

('drc-karisimbi', 'Karisimbi, DRC', 'School Pledge', ARRAY[29.21, -1.65], 
 'Événements d''engagement scolaire, Sensibilisation de la communauté.', 12, NULL,
 '**Activity Snapshot:**
> Événements d''engagement scolaire, Sensibilisation de la communauté.'),

('drc-goma', 'Goma, DRC', 'School Pledge', ARRAY[29.22, -1.67], 
 'Événements d''engagement scolaire, Sensibilisation de la communauté, Sensibilisation de la jeunesse interreligieuse.', 14, NULL,
 '**Activity Snapshot:**
> Événements d''engagement scolaire, Sensibilisation de la communauté, Sensibilisation de la jeunesse interreligieuse.');
