import { pgTable, uuid, text, numeric, date, timestamp, boolean, integer } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  budget: numeric('budget', { precision: 12, scale: 2 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const meetings = pgTable('meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  datetime: timestamp('datetime').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const credentials = pgTable('credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  username: text('username'),
  password: text('password'),
  url: text('url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const files = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  size: integer('size').notNull(),
  mimeType: text('mime_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const otps = pgTable('otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  used: boolean('used').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  website: text('website'),
  location: text('location'),
  industry: text('industry'),
  notes: text('notes'),
  status: text('status').notNull().default('not_contacted'),
  source: text('source').default('manual'),
  bookmarked: boolean('bookmarked').default(false).notNull(),
  favorited: boolean('favorited').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  templateId: uuid('template_id').references(() => emailTemplates.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull().default('draft'),
  totalLeads: integer('total_leads').notNull().default(0),
  sentCount: integer('sent_count').notNull().default(0),
  failedCount: integer('failed_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  sentAt: timestamp('sent_at'),
})

export const campaignSends = pgTable('campaign_sends', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),
  messageId: text('message_id'),
  sentAt: timestamp('sent_at'),
})

export const blogs = pgTable('blogs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  publishDate: date('publish_date'),
  thumbnail: text('thumbnail'),
  tag: text('tag'),
  author: text('author'),
  readTime: integer('read_time'),
  description: text('description'),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const testimonials = pgTable('testimonials', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  company: text('company'),
  avatar: text('avatar'),
  testimonial: text('testimonial').notNull(),
  active: boolean('active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const caseStudies = pgTable('case_studies', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  thumbnail: text('thumbnail'),
  industry: text('industry'),
  stack: text('stack'),
  description: text('description'),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
export type EmailTemplate = typeof emailTemplates.$inferSelect
export type Campaign = typeof campaigns.$inferSelect
export type CampaignSend = typeof campaignSends.$inferSelect

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
export type Meeting = typeof meetings.$inferSelect
export type NewMeeting = typeof meetings.$inferInsert
export type Credential = typeof credentials.$inferSelect
export type NewCredential = typeof credentials.$inferInsert
export type User = typeof users.$inferSelect
export type ProjectFile = typeof files.$inferSelect

export type Blog = typeof blogs.$inferSelect
export type NewBlog = typeof blogs.$inferInsert
export type Testimonial = typeof testimonials.$inferSelect
export type NewTestimonial = typeof testimonials.$inferInsert
export type CaseStudy = typeof caseStudies.$inferSelect
export type NewCaseStudy = typeof caseStudies.$inferInsert
