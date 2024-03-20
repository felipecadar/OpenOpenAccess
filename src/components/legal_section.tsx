export default function LegalSection() {
  return (
    <div className="flex w-full flex-row flex-wrap justify-start gap-2 text-justify text-slate-700 ">
      <p>These research papers are the</p>
      <a href="https://openaccess.thecvf.com/menu" className="text-sky-900 underline">
        Open Access
      </a>
      <p> and </p>
      <a href="https://papers.nips.cc/" className="text-sky-900 underline">
        NeurIPS
      </a>
      <p>
        {" "}
        versions, provided by the {""}
        <a className="text-sky-900 underline" href="https://www.thecvf.com/">
          Computer Vision Foundation
        </a>
        {""} and{" "}
        <a className="text-sky-900 underline" href="https://nips.cc/">
         Conference on Neural Information Processing Systems
        </a>
        .
      </p>
      <p>
        Except for the watermark, they are identical to the accepted versions;
        the final published version of the proceedings is available on IEEE
        Xplore.This material is presented to ensure timely dissemination of
        scholarly and technical work. Copyright and all rights therein are
        retained by authors or by other copyright holders. All persons copying
        this information are expected to adhere to the terms and constraints
        invoked by each authors copyright.
      </p>
    </div>
  );
}
