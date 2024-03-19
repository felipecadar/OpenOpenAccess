import Link from "next/link";

export type paper_type = {
    title: string;
    authors: string;
    abstract: string;
    arXiv: string | null | undefined;
    pdf: string | null | undefined;
    bibref: string | null | undefined;
    supp: string | null | undefined;
    openaccess_url: string | null | undefined;
    NeurIPS: string | null | undefined;
};

export default function PaperView(props: { paper: paper_type }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-slate-300 p-10 "
    >
      <h1 className="text-justify text-3xl font-bold">{props.paper.title}</h1>

      <p className="">{props.paper.authors}</p>
      <p className=" text-justify ">{props.paper.abstract}</p>

      {/* show bibref as mono text */}
      <div className="flex flex-row gap-4">
        {props.paper.bibref && (
          <span className="rounded border-[1px] border-solid border-slate-700 bg-slate-200 p-1 text-justify font-mono text-xs ">
            {props.paper.bibref}
          </span>
        )}
      </div>

      <div className="flex flex-row gap-4">
        {props.paper.openaccess_url && (
          <Link href={props.paper.openaccess_url}>
            <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
              Open Access
            </button>
          </Link>
        )}

        {props.paper.arXiv && (
          <Link href={props.paper.arXiv}>
            <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
              arXiv
            </button>
          </Link>
        )}

        {props.paper.pdf && (
          <Link href={props.paper.pdf}>
            <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
              PDF
            </button>
          </Link>
        )}
        {props.paper.supp && (
          <Link href={props.paper.supp}>
            <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
              Supplementary
            </button>
          </Link>
        )}

        {props.paper.NeurIPS && (
          <Link href={props.paper.NeurIPS}>
            <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
              NeurIPS
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
