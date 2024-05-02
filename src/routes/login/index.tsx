import { component$ } from "@builder.io/qwik";
import { useAuthSession, useAuthSignin } from "../plugin@lucia";

export default component$(() => {
  const session = useAuthSession();

  const signIn = useAuthSignin();

  console.log(session.value);

  return (
    <div>
      <button
        type="button"
        onClick$={() => signIn.submit({})}
        class="rounded border-4 border-gray-700 bg-slate-100 px-5 py-2 shadow"
      >
        Login With GitHub
      </button>
    </div>
  );
});
