/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
// import Highlighter from "react-highlight-words"; 

type paper_type = {
  title: string;
  authors: string;
  abstract: string;
  arXiv: string | null | undefined;
  pdf: string | null | undefined;
  bibref: string | null | undefined;
  supp: string | null | undefined;
  openaccess_url: string | null | undefined;
};

function shuffle(array: paper_type[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex]!,
      array[currentIndex]!,
    ];
  }

  return array;
}

export default function Home() {
  const all_dogs = {
    regular: "/paperhoundlogo/PaperHound_regular.png",
    akward: "/paperhoundlogo/PaperHound_akward.png",
    angry: "/paperhoundlogo/PaperHound_angry.png",
    cool: "/paperhoundlogo/PaperHound_cool.png",
    curious: "/paperhoundlogo/PaperHound_curious.png",
    happy: "/paperhoundlogo/PaperHound_happy.png",
  };

  const [ogdata, ogsetData] = useState<paper_type[]>([]);
  const [data, setData] = useState<paper_type[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(true);
  const [keyWords, setKeyWords] = useState<string[]>([]);
  const [isLegalSectionCollapsed, setIsLegalSectionCollapsed] = useState(false);
  const [dog_figure, setDogFigure] = useState<string>(
    "/paperhoundlogo/PaperHound_regular.png",
  );

  useEffect(() => {
    fetch("/papers_info.json")
      .then((response) => response.json() as Promise<paper_type[]>)
      // .then(data => setData(data))
      .then((data) => {
        // filter empty data ( without title or authors or abstract )
        let filteredData = data.filter(
          (paper) => paper.title && paper.authors && paper.abstract,
        );
        // shuffle the data
        filteredData = shuffle(filteredData);
        ogsetData(filteredData);
        setData(filteredData);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    searchFilter();
  }, [search]);

  function searchFilter() {
    // t+ to search for the title including the search term
    // t- to search for the title excluding the search term

    // a+ to search for the abstract including the search term
    // a- to search for the abstract excluding the search term

    // au+ to search for the authors including the search term
    // au- to search for the authors excluding the search term

    // separate all terms by space

    const valid_inits = ["t+", "t-", "a+", "a-", "au+", "au-"];

    // reset data to original data
    let filterData = ogdata;
    const _keyWords = [] as string[];

    const searchTerms = search
      .trim()
      .split(" ")
      .filter((term) => term.length > 0);
    searchTerms.forEach((term) => {
      // if starts with t, a, au followed by + or -, make sure there is a term after it
      if (
        valid_inits.includes(term.toLowerCase().slice(0, 2)) &&
        term.length < 3
      ) {
        // skip this term
        return;
      }

      if (term.toLowerCase().startsWith("t+")) {
        const searchTerm = term.replace("t+", "");
        _keyWords.push(searchTerm);
        filterData = filterData.filter((paper) =>
          paper.title.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("t-")) {
        const searchTerm = term.replace("t-", "");
        filterData = filterData.filter(
          (paper) =>
            !paper.title.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("a+")) {
        const searchTerm = term.replace("a+", "");
        _keyWords.push(searchTerm);
        filterData = filterData.filter((paper) =>
          paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("a-")) {
        const searchTerm = term.replace("a-", "");
        filterData = filterData.filter(
          (paper) =>
            !paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("au+")) {
        const searchTerm = term.replace("au+", "");
        _keyWords.push(searchTerm);
        filterData = filterData.filter((paper) =>
          paper.authors
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        );
      } else if (term.toLowerCase().startsWith("au-")) {
        const searchTerm = term.replace("au-", "");
        filterData = filterData.filter(
          (paper) =>
            !paper.authors
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        );
      } else {
        _keyWords.push(term);
        filterData = filterData.filter(
          (paper) =>
            paper.title.toLowerCase().includes(term.toLowerCase()) ||
            paper.authors
              .toLowerCase()
              .includes(term.toLowerCase()) ||
            paper.abstract.toLowerCase().includes(term.toLowerCase()),
        );
      }
    });

    setKeyWords(_keyWords);
    setData(filterData);
    setDogFigure(all_dogs.regular);

    if (searchTerms.length > 0) {
      if (filterData.length == 1) {
        setDogFigure(all_dogs.happy);
      } else if (filterData.length == 0) {
        setDogFigure(all_dogs.angry);
      } else if (filterData.length > 20) {
        setDogFigure(all_dogs.curious);
      }
    }
  }

  return (
    <>
      <Head>
        <title>PaperHound</title>
        <meta name="description" content="Open Acess made easy." />
        <link rel="icon" href="/Mini.png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-white">
        <div className="">
          <div className="flex flex-row flex-wrap items-end justify-center gap-4 pb-4 pt-20">
            <img src={dog_figure} className="w-28" />
            <h1 className=" font-serif text-6xl font-bold  text-sky-900 ">
              PaperHound
            </h1>
          </div>
        </div>

        {/* make a instruction button fixed on the top right corner in a shape of a little circle with an interrogation */}
        <div className="fixed right-4 top-4">
          <button
            className="rounded-full bg-slate-200 px-4 py-2"
            onClick={() => setIsSectionCollapsed(!isSectionCollapsed)}
          >
            ?
          </button>
        </div>

        {/* make a nice header with the using instructions*/}
        {/* make it colapsable */}

        {/* make in input box */}
        {/* <div className="flex flex-row flex-wrap items-center justify-center gap-4 pt-4"> */}
        <input
          type="text"
          placeholder="Search"
          className=" mx-10 w-3/4 max-w-96 rounded-md border-2 border-slate-300 px-4 py-2 focus:ring-sky-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* make a little comentary about where the papers came from */}
        {/* <p className="flex w-full flex-row flex-wrap justify-center text-justify gap-2 text-slate-700"> */}
        {/* make a fixed footer */}
        {!isLegalSectionCollapsed && (
          <div className="fixed bottom-0 w-full bg-slate-200 p-4">
            {/* add a little x to close it on the top right corner */}
            <button
              className="float-right rounded-full bg-slate-300 px-4 py-2"
              onClick={() =>
                setIsLegalSectionCollapsed(!isLegalSectionCollapsed)
              }
            >
              Close
            </button>

            <div className="flex w-full flex-row flex-wrap justify-start gap-2 text-justify text-slate-700 ">
              <p>These research papers are the</p>
              <a
                href="https://openaccess.thecvf.com/menu"
                className="text-sky-900"
              >
                Open Access
              </a>
              <p>
                {" "}
                versions, provided by the {""}
                <a className="text-sky-900" href="https://www.thecvf.com/">
                  Computer Vision Foundation
                </a>
                .
              </p>
              <p>
                Except for the watermark, they are identical to the accepted
                versions; the final published version of the proceedings is
                available on IEEE Xplore.This material is presented to ensure
                timely dissemination of scholarly and technical work. Copyright
                and all rights therein are retained by authors or by other
                copyright holders. All persons copying this information are
                expected to adhere to the terms and constraints invoked by each
                authors copyright.
              </p>
            </div>
          </div>
        )}

        {/* Collapsible section */}
        <div className="flex flex-col items-start justify-center gap-4 pt-4">
          {!isSectionCollapsed && (
            <>
              <p className="">
                Search for papers by title, authors, or abstract
              </p>
              <p className="">
                Use
                <span className=" m-1 rounded border-[1px] border-solid border-slate-700 bg-slate-200 font-mono ">
                  {" "}
                  t+{" "}
                </span>
                to search for the title including the search term
              </p>
              <p className="">
                Use
                <span className=" m-1 rounded border-[1px] border-solid border-slate-700 bg-slate-200 font-mono ">
                  {" "}
                  t-{" "}
                </span>
                to search for the title excluding the search term
              </p>
              <p className="">
                Use
                <span className=" m-1 rounded border-[1px] border-solid border-slate-700 bg-slate-200 font-mono ">
                  {" "}
                  a+{" "}
                </span>
                to search for the abstract including the search term
              </p>
              <p className="">
                Use
                <span className=" m-1 rounded border-[1px] border-solid border-slate-700 bg-slate-200 font-mono ">
                  {" "}
                  a-{" "}
                </span>
                to search for the abstract excluding the search term
              </p>
              <p className="">
                Use
                <span className=" m-1 rounded border-[1px] border-solid border-slate-700 bg-slate-200 font-mono ">
                  {" "}
                  au+{" "}
                </span>
                to search for the authors including the search term
              </p>
              <p className="">
                Use
                <span className=" m-1 rounded border-[1px] border-solid border-slate-700 bg-slate-200 font-mono ">
                  {" "}
                  au-{" "}
                </span>
                to search for the authors excluding the search term
              </p>
              <p className="">Separate all terms by space</p>
            </>
          )}
        </div>

        {/* <button
                  className="rounded-md bg-blue-500 px-4 py-2 text-white"
                  onClick={() => setIsSectionCollapsed(!isSectionCollapsed)}
                  >
                  {isSectionCollapsed ? "Show Instructions" : "Hide Instructions"}
                </button> */}
        {/* </div> */}

        {/* make a nice list of papers */}

        <div className="container flex flex-col items-center justify-center gap-12 px-4 pb-28 ">
          {search.length > 0 && (
            <>
              <p className="pt-4 ">{`Found ${data.length} out of ${ogdata.length} papers`}</p>
              {data.slice(0, 200).map((paper, index) => {
                const authors = paper.authors;
                const title = paper.title;
                const abstract = paper.abstract;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-slate-300 p-10 "
                  >
                    <h1 className="text-justify text-3xl font-bold">
                      {/* <Highlighter 
                        highlightClassName="YourHighlightClass"
                        searchWords={keyWords} 
                        autoEscape={true} 
                        textToHighlight={title}
                      /> */}
                      {title}
                    </h1>

                    <p className="">{authors}</p> 
                    {/* <Highlighter 
                      highlightClassName="YourHighlightClass"
                      searchWords={keyWords} 
                      autoEscape={true} 
                      textToHighlight={authors}
                    />  */}

                    <p className=" text-justify ">{abstract}</p>

                    {/* <Highlighter 
                      highlightClassName="YourHighlightClass"
                      searchWords={keyWords} 
                      autoEscape={true} 
                      textToHighlight={abstract}
                    /> */}

                    {/* show bibref as mono text */}
                    <div className="flex flex-row gap-4">
                      {paper.bibref && (
                        <span className="rounded border-[1px] border-solid border-slate-700 bg-slate-200 p-1 text-justify font-mono text-xs ">
                          {paper.bibref}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-row gap-4">
                      {paper.openaccess_url && (
                        <Link href={paper.openaccess_url}>
                          <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
                            Open Access
                          </button>
                        </Link>
                      )}

                      {paper.arXiv && (
                        <Link href={paper.arXiv}>
                          <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
                            arXiv
                          </button>
                        </Link>
                      )}

                      {paper.pdf && (
                        <Link href={paper.pdf}>
                          <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
                            PDF
                          </button>
                        </Link>
                      )}
                       {paper.supp && (
                        <Link href={paper.supp}>
                          <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
                            Supplementary
                          </button>
                        </Link>
                      )}

                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </main>
    </>
  );
}
