/* A section the user added in the home editor. Its words live in home-layout.json
   (blocks.<name>) and its image in public/slots/<name>.webp, so both survive a
   rebuild. The starting words are placeholders: the word-for-word checker fails the
   build until the user replaces them, so nothing invented can ship by accident. */
import { DesignSlot } from "@/components/ui/Bits";
import { slotFile } from "@/components/ui/Slot";
import { BLOCK_PLACEHOLDER } from "./blocks";

export default function Block({ name, content }: { name: string; content: Record<string, string> }) {
  const type = name.split("-")[0];
  const title = content.title ?? BLOCK_PLACEHOLDER.title;
  const body = content.body ?? BLOCK_PLACEHOLDER.body;
  const file = `${name.toLowerCase()}.webp`;
  const src = slotFile(file);
  const pic = src
    ? <img className="slot-img" data-slot={file} src={src} alt={content.alt ?? ""} loading="lazy" />
    : <DesignSlot file={file} purpose="drop an image here in the editor" px="1600 x 1000" />;

  const text = (
    <div className={`head ${type === "Text" ? "center" : ""}`}>
      <h2 className="h2" data-e-block={name} data-e-field="title">{title}</h2>
      <div className="lead"><p data-e-block={name} data-e-field="body">{body}</p></div>
    </div>
  );

  if (type === "FullImg") {
    return <section className="section" id={name}><div className="container">{pic}</div></section>;
  }
  if (type === "Text") {
    return <section className="section" id={name}><div className="container">{text}</div></section>;
  }
  return (
    <section className="section" id={name}>
      <div className="container split">{text}{pic}</div>
    </section>
  );
}
