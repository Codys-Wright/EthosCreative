import { createFileRoute } from "@tanstack/react-router";
import { BlogContentWithToc } from "@components";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const ABOUT_CONTENT = `## The My Artist Type Quiz

The My Artist Type Quiz was developed to help artists understand themselves in much the same way as personality tests like *The Enneagram*, *The Big 5 Aspects Test*, and *Myers-Briggs* have helped so many in the general population understand their temperaments. What makes this quiz unique is that it's been designed specifically for artists.

Whether you're a musician, painter, actor, dancer, photographer, writer, illustrator, chef, designer, or any other kind of creator, **The My Artist Type Quiz** (or **M.A.T. Quiz**) will act as a mirror and magnifying glass to help you gain a deeper understanding of the inner workings of your artistic temperament.

Your results will also give you a framework from which to relate to and understand other Artist Types. This is particularly helpful in the context of creative collaborations, where incredibly nuanced interpersonal and creative dynamics are at play.

**There are 10 distinct Artist Types, each with their own strengths and weaknesses.**

Understanding exactly where you fall on the continuum relative to other artists is also helpful in navigating your path at the intersection of art and commerce.

---

It can be a lot of fun to compare and contrast your results with those of your artist friends and associates. While on a deeper level, knowing each other's Artist Types can be extremely helpful in understanding the nuanced dynamics that are often at play in creative situations. We're then setup to have more patience for each other's differences (and to value them more than we may otherwise have), and to navigate our collaborations more effectively.

## The Story

The My Artist Type Quiz was created by 50x Platinum Songwriter, Producer, Multi-Medium Artist, Author, and Educator, **Adam Watts**.

With a deep interest in interpersonal dynamics and an appreciation for personality assessments like *The Enneagram* and *The Big 5 Aspects Test*, Watts began to develop a similar assessment designed specifically for those wonderfully idiosyncratic human beings we call artists.

Fascinated by the notion that one's gifting combines with their personalities and eccentricities to form a unique creative identity, Watts began to create detailed profiles of these identities and identified **10 distinct Artist Types**.

The result is a quiz that can organize this identity into a **Primary Artist Type**.

After more than two decades working behind the scenes in the entertainment business (in the music, film, tv, fine art worlds and beyond), Watts noticed profoundly distinct personality traits in the wide variety of creatives he worked with and observed. It was as if artists fell into distinct categories. They each interacted in ways that were consistent and surprisingly predictable (even, paradoxically, in their unpredictability).

## In His Words

> "I began to realize that artists are like their own species. I noticed that within that species, it's almost as if there are different breeds. Each with their own distinct traits and intrinsic ways of approaching the creative process.
>
> I thought that it would be useful and fun to see if I could identify a concise list of distinct artist types. Ones that I'd seen not only in my own experience, but out in the world, beyond my own experiences and throughout history.
>
> I felt that if I could accurately name and define these distinct types then it could be extremely helpful in similar ways that The Enneagram and The Big 5 Aspects Tests have been for people to not only understand themselves but how they interact with others.
>
> Though every artist is incredibly complex, my aim was to define each type in such a way that every artist past and present could fit quite snuggly into a Primary Artist Type.
>
> So after considerable thought, research, and development I'm very excited about the resulting quiz. The results form a nuanced picture of how the artist tends to function creatively and relationally.
>
> As I began to share the quiz, the feedback from artists has been very validating with virtually everyone expressing that their results were extremely accurate, interesting, and helpful.
>
> My goal has never been to pigeonhole artists or narrowly define them, but rather to give them a kind of mirror and magnifying glass to help them further understand their uniqueness relative to others so that they could have a sense of orientation and relativity not only in their inner creative worlds, but also in the context of collaborations, and in business situations."
`;

function AboutPage() {
  return (
    <main className="container mx-auto py-8">
      <BlogContentWithToc
        title="About"
        subtitle="The story behind the My Artist Type Quiz"
        content={ABOUT_CONTENT}
        thumbnail="https://images.squarespace-cdn.com/content/v1/63c4bd6cf346a0659f2ee2dc/421041e6-382b-4756-a503-215fb63fa923/Adam+Watts+New+Press+Photo-V2-with+text.jpg?format=2500w"
        sidebarImage
        author="Adam Watts"
        authorImage="/svgs/MyArtistTypeLogo.svg"
      />
    </main>
  );
}
