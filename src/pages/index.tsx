import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

type paper_type = {
  title: string;
  authors: string[];
  abstract: string;
  arXiv: string | null | undefined;
  pdf: string | null | undefined;
  bibref: string | null | undefined;
  supp: string | null | undefined;
};

export default function Home() {
  // get db.json from public folder
  // const data = fetch('/db.json')
  //   .then(response => response.json())
  //   .catch(error => console.error(error))

  const [ogdata, ogsetData] = useState<paper_type[]>([]);
  const [data, setData] = useState<paper_type[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(true);

  useEffect(() => {
    fetch("/db.json")
      .then((response) => response.json() as Promise<paper_type[]>)
      // .then(data => setData(data))
      .then((data) => {
        // filter empty data ( without title or authors or abstract )
        const filteredData = data.filter(
          (paper) => paper.title && paper.authors && paper.abstract,
        );
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

    // reset data to original data
    let filterData = ogdata;

    const searchTerms = search.split(" ");
    searchTerms.forEach((term) => {
      if (term.includes("t+")) {
        const searchTerm = term.replace("t+", "");
        filterData = filterData.filter((paper) =>
          paper.title.toLowerCase().includes(searchTerm),
        );
      } else if (term.toLowerCase().includes("t-")) {
        const searchTerm = term.replace("t-", "");
        filterData = filterData.filter(
          (paper) => !paper.title.toLowerCase().includes(searchTerm),
        );
      } else if (term.toLowerCase().includes("a+")) {
        const searchTerm = term.replace("a+", "");
        filterData = filterData.filter((paper) =>
          paper.abstract.toLowerCase().includes(searchTerm),
        );
      } else if (term.toLowerCase().includes("a-")) {
        const searchTerm = term.replace("a-", "");
        filterData = filterData.filter(
          (paper) => !paper.abstract.toLowerCase().includes(searchTerm),
        );
      } else if (term.toLowerCase().includes("au+")) {
        const searchTerm = term.replace("au+", "");
        filterData = filterData.filter((paper) =>
          paper.authors.join(", ").toLowerCase().includes(searchTerm),
        );
      }
      else if (term.toLowerCase().includes("au-")) {
        const searchTerm = term.replace("au-", "");
        filterData = filterData.filter(
          (paper) => !paper.authors.join(", ").toLowerCase().includes(searchTerm),
        );
      }
      else {
        filterData = filterData.filter((paper) =>
          paper.title.toLowerCase().includes(term) ||
          paper.authors.join(", ").toLowerCase().includes(term) ||
          paper.abstract.toLowerCase().includes(term),
        );
      }
    });
    setData(filterData);
  }

  return (
    <>
      <Head>
        <title>Open Open Access</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-bold pt-20 ">Open Open Access</h1>
        {/* make a nice header with the using instructions*/}
        {/* make it colapsable */}

        {/* Collapsible section */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4">
          {!isSectionCollapsed && (
            <>
              <p className="">
                Search for papers by title, authors, or abstract
              </p>
              <p className="">
                Use t+ to search for the title including the search term
              </p>
              <p className="">
                Use t- to search for the title excluding the search term
              </p>
              <p className="">
                Use a+ to search for the abstract including the search term
              </p>
              <p className="">
                Use a- to search for the abstract excluding the search term
              </p>
              <p className="">
                Use au+ to search for the authors including the search term
              </p>
              <p className="">
                Use au- to search for the authors excluding the search term
              </p>
              <p className="">Separate all terms by space</p>
            </>
          )}
        </div>

        {/* make in input box */}
        <div className="flex flex-row items-center justify-center gap-4 pt-4">
          <input
            type="text"
            placeholder="Search"
            className="rounded-md px-4 py-2 border-2 border-slate-300 w-96"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* <button className="bg-white text-black px-4 py-2 rounded-md" onClick={searchFilter}>Search</button> */}
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white"
            onClick={() => setIsSectionCollapsed(!isSectionCollapsed)}
          >
            {isSectionCollapsed ? "Show Instructions" : "Hide Instructions"}
          </button>
        </div>

        {/* found X out of Y.... */}

        {/* make a nice list of papers */}

        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {search.length > 0  && (
            <>
            <p className="pt-4 ">{`Filtered ${data.length} out of ${ogdata.length} papers`}</p>
            {data.slice(0, 100).map((paper, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center gap-4 border-2 border-slate-300 rounded-2xl p-10 "
              >
                <h1 className="text-3xl font-bold ">{paper.title}</h1>
                <p className="">
                  {paper.authors.join(", ")}
                </p>
                <p className="">{paper.abstract}</p>
                <div className="flex flex-row gap-4">
                  {paper.arXiv && (
                    // make a nice arXiv button
                    <Link href={paper.arXiv}>
                      <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
                        arXiv
                      </button>
                    </Link>
                  )}

                  {paper.pdf && (
                    // make a nice pdf button
                    <Link href={paper.pdf}>
                      <button className="rounded-md bg-blue-100 px-4 py-2 text-black">
                        PDF
                      </button>
                    </Link>
                  )}

                </div>
              </div>
            ))}
            </>
          )}
        </div>
      </main>
    </>
  );
}
