
export default function HelpSection() {
    return (
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
        <p className="">Separate all terms by space and use quotes to key terms together :) </p>
        <p> Example: 
          <span className=" m-2 rounded border-[1px] border-solid border-slate-700 bg-slate-200 font-mono ">
            {" "}
            t+&quot;Weighted Sparse&quot;
            {" "}
          </span>
          

        </p>

      </>
    );
}

