import { SVGProps, memo } from 'react'

const DarkSkeletonSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 163 88" {...props}>
    <g clipPath="url(#a)">
      <rect width={161.5} height={88} x={0.742} fill="#121212" rx={6} />
      <mask id="b" fill="#fff">
        <path d="M.742 6a6 6 0 0 1 6-6h7v88h-7a6 6 0 0 1-6-6V6Z" />
      </mask>
      <path fill="#121212" d="M.742 6a6 6 0 0 1 6-6h7v88h-7a6 6 0 0 1-6-6V6Z" />
      <path
        fill="#292929"
        d="M.742 0h13-13Zm13 88h-13 13Zm-13 0V0v88Zm14-88v88h-2V0h2Z"
        mask="url(#b)"
      />
      <mask id="c" fill="#fff">
        <path d="M156.242 0a6 6 0 0 1 6 6v7h-148.5V0h142.5Z" />
      </mask>
      <path fill="#121212" d="M156.242 0a6 6 0 0 1 6 6v7h-148.5V0h142.5Z" />
      <path
        fill="#292929"
        d="M162.242 0v13V0Zm-148.5 13V0v13Zm0-13h148.5-148.5Zm148.5 14h-148.5v-2h148.5v2Z"
        mask="url(#c)"
      />
      <rect
        width={86.474}
        height={23.5}
        x={44.755}
        y={21.5}
        fill="#1F1F1F"
        stroke="#292929"
        rx={2.5}
      />
      <rect
        width={86.474}
        height={23.5}
        x={44.755}
        y={51.5}
        fill="#1F1F1F"
        stroke="#292929"
        rx={2.5}
      />
      <rect width={19.232} height={1.5} x={52.941} y={28} fill="#B4B4B4" rx={0.75} />
      <rect width={19.232} height={1.5} x={52.941} y={56.5} fill="#B4B4B4" rx={0.75} />
      <rect width={19.232} height={1.5} x={78.376} y={28} fill="#FAFAFA" rx={0.75} />
      <rect width={19.232} height={1.5} x={78.376} y={56.5} fill="#FAFAFA" rx={0.75} />
      <rect width={44.047} height={1.5} x={78.376} y={33.25} fill="#FAFAFA" rx={0.75} />
      <rect width={44.047} height={1.5} x={78.376} y={61.75} fill="#FAFAFA" rx={0.75} />
      <rect width={20.5} height={3.75} x={18.492} y={4.625} fill="#5bbc26" rx={1.875} />
      <rect width={20.5} height={3.75} x={44.255} y={4.625} fill="#4D4D4D" rx={1.875} />
      <rect width={20.5} height={3.75} x={69.505} y={4.625} fill="#4D4D4D" rx={1.875} />
      <rect width={5} height={5} x={150} y={4.625} fill="#5bbc26" rx={100} />
      <rect width={20.5} height={1.5} x={101.923} y={28} fill="#5bbc26" rx={0.75} />
      <rect width={3.75} height={3.75} x={5.367} y={4.625} fill="#5bbc26" rx={1} />
      <rect width={3.75} height={3.75} x={5.367} y={13.375} fill="#4D4D4D" rx={1} />
      <rect width={3.75} height={3.75} x={5.367} y={20.875} fill="#4D4D4D" rx={1} />
      <rect width={3.75} height={3.75} x={5.367} y={28.375} fill="#4D4D4D" rx={1} />
      <rect width={3.75} height={3.75} x={5.367} y={35.875} fill="#4D4D4D" rx={1} />
    </g>
    <rect width={160.5} height={87} x={1.242} y={0.5} stroke="#292929" rx={5.5} />
    <defs>
      <clipPath id="a">
        <rect width={161.5} height={88} x={0.742} fill="#fff" rx={6} />
      </clipPath>
    </defs>
  </svg>
)

const LightSkeletonSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 162 88" {...props}>
    <g clipPath="url(#a)">
      <rect width={161.5} height={88} x={0.242} fill="#F8F9FA" rx={6} />
      <mask id="b" fill="#fff">
        <path d="M.242 6a6 6 0 0 1 6-6h7v88h-7a6 6 0 0 1-6-6V6Z" />
      </mask>
      <path fill="#F8F9FA" d="M.242 6a6 6 0 0 1 6-6h7v88h-7a6 6 0 0 1-6-6V6Z" />
      <path
        fill="#E6E8EB"
        d="M.242 0h13-13Zm13 88h-13 13Zm-13 0V0v88Zm14-88v88h-2V0h2Z"
        mask="url(#b)"
      />
      <mask id="c" fill="#fff">
        <path d="M155.742 0a6 6 0 0 1 6 6v7h-148.5V0h142.5Z" />
      </mask>
      <path fill="#F8F9FA" d="M155.742 0a6 6 0 0 1 6 6v7h-148.5V0h142.5Z" />
      <path
        fill="#E6E8EB"
        d="M161.742 0v13V0Zm-148.5 13V0v13Zm0-13h148.5-148.5Zm148.5 14h-148.5v-2h148.5v2Z"
        mask="url(#c)"
      />
      <rect
        width={86.474}
        height={23.5}
        x={44.255}
        y={21.5}
        fill="#FCFCFC"
        stroke="#E6E8EB"
        rx={2.5}
      />
      <rect
        width={86.474}
        height={23.5}
        x={44.255}
        y={51.5}
        fill="#FCFCFC"
        stroke="#E6E8EB"
        rx={2.5}
      />
      <rect width={19.232} height={1.5} x={52.441} y={28} fill="#525252" rx={0.75} />
      <rect width={19.232} height={1.5} x={52.441} y={56.5} fill="#525252" rx={0.75} />
      <rect width={19.232} height={1.5} x={77.876} y={28} fill="#11181C" rx={0.75} />
      <rect width={19.232} height={1.5} x={77.876} y={56.5} fill="#11181C" rx={0.75} />
      <rect width={44.047} height={1.5} x={77.876} y={33.25} fill="#11181C" rx={0.75} />
      <rect width={44.047} height={1.5} x={77.876} y={61.75} fill="#11181C" rx={0.75} />
      <rect width={20.5} height={3.75} x={18.492} y={4.625} fill="#5bbc26" rx={1.875} />
      <rect width={20.5} height={3.75} x={43.755} y={4.625} fill="#B2B2B2" rx={1.875} />
      <rect width={20.5} height={3.75} x={69.005} y={4.625} fill="#B2B2B2" rx={1.875} />
      <rect width={5} height={5} x={150} y={4.625} fill="#5bbc26" rx={100} />
      <rect width={20.5} height={1.5} x={101.923} y={28} fill="#5bbc26" rx={0.75} />
      <rect width={3.75} height={3.75} x={5.367} y={4.625} fill="#5bbc26" rx={1} />
      <rect width={3.75} height={3.75} x={4.867} y={20.875} fill="#B2B2B2" rx={1} />
      <rect width={3.75} height={3.75} x={4.867} y={28.375} fill="#B2B2B2" rx={1} />
      <rect width={3.75} height={3.75} x={4.867} y={35.875} fill="#B2B2B2" rx={1} />
    </g>
    <rect width={160.5} height={87} x={0.742} y={0.5} stroke="#E6E8EB" rx={5.5} />
    <defs>
      <clipPath id="a">
        <rect width={161.5} height={88} x={0.242} fill="#fff" rx={6} />
      </clipPath>
    </defs>
  </svg>
)

const SystemSkeletonSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 163 88" {...props}>
    <g clipPath="url(#a)">
      <rect width={161.5} height={88} x={0.742} fill="#1C1C1C" rx={6} />
      <mask id="b" fill="#fff">
        <path d="M.742 6a6 6 0 0 1 6-6h7v88h-7a6 6 0 0 1-6-6V6Z" />
      </mask>
      <path fill="#1C1C1C" d="M.742 6a6 6 0 0 1 6-6h7v88h-7a6 6 0 0 1-6-6V6Z" />
      <path
        fill="#2E2E2E"
        d="M.742 0h13-13Zm13 88h-13 13Zm-13 0V0v88Zm14-88v88h-2V0h2Z"
        mask="url(#b)"
      />
      <mask id="c" fill="#fff">
        <path d="M156.242 0a6 6 0 0 1 6 6v7h-148.5V0h142.5Z" />
      </mask>
      <path fill="#1C1C1C" d="M156.242 0a6 6 0 0 1 6 6v7h-148.5V0h142.5Z" />
      <path
        fill="#2E2E2E"
        d="M162.242 0v13V0Zm-148.5 13V0v13Zm0-13h148.5-148.5Zm148.5 14h-148.5v-2h148.5v2Z"
        mask="url(#c)"
      />
      <rect
        width={86.474}
        height={23.5}
        x={44.755}
        y={21.5}
        fill="#232323"
        stroke="#2E2E2E"
        rx={2.5}
      />
      <rect
        width={86.474}
        height={23.5}
        x={44.755}
        y={51.5}
        fill="#232323"
        stroke="#2E2E2E"
        rx={2.5}
      />
      <rect width={19.232} height={1.5} x={52.941} y={28} fill="#A0A0A0" rx={0.75} />
      <rect width={19.232} height={1.5} x={52.941} y={56.5} fill="#A0A0A0" rx={0.75} />
      <rect width={19.232} height={1.5} x={78.376} y={28} fill="#EDEDED" rx={0.75} />
      <rect width={19.232} height={1.5} x={78.376} y={56.5} fill="#EDEDED" rx={0.75} />
      <rect width={44.047} height={1.5} x={78.376} y={33.25} fill="#EDEDED" rx={0.75} />
      <rect width={44.047} height={1.5} x={78.376} y={61.75} fill="#EDEDED" rx={0.75} />
      <rect width={20.5} height={3.75} x={18.492} y={4.625} fill="#5bbc26" rx={1.875} />
      <rect width={20.5} height={3.75} x={44.255} y={4.625} fill="#707070" rx={1.875} />
      <rect width={20.5} height={3.75} x={69.505} y={4.625} fill="#707070" rx={1.875} />
      <rect width={5} height={5} x={150} y={4.625} fill="#5bbc26" rx={100} />
      <rect width={20.5} height={1.5} x={101.923} y={28} fill="#5bbc26" rx={0.75} />
      <rect width={3.75} height={3.75} x={5.367} y={4.625} fill="#5bbc26" rx={1} />
      <rect width={3.75} height={3.75} x={5.367} y={20.875} fill="#707070" rx={1} />
      <rect width={3.75} height={3.75} x={5.367} y={28.375} fill="#707070" rx={1} />
      <rect width={3.75} height={3.75} x={5.367} y={35.875} fill="#707070" rx={1} />
      <mask
        id="d"
        width={131}
        height={88}
        x={32}
        y={0}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: 'alpha',
        }}>
        <path fill="#000" d="M130.534 0 32.451 88h129.68V0h-31.597Z" />
      </mask>
      <g mask="url(#d)">
        <path fill="#F8F9FA" d="M.742 0h161.5v88H.742z" />
        <mask id="e" fill="#fff">
          <path d="M156.242 0a6 6 0 0 1 6 6v7h-148.5V0h142.5Z" />
        </mask>
        <path fill="#F8F9FA" d="M156.242 0a6 6 0 0 1 6 6v7h-148.5V0h142.5Z" />
        <path
          fill="#E6E8EB"
          d="M162.242 0v13V0Zm-148.5 13V0v13Zm0-13h148.5-148.5Zm148.5 14h-148.5v-2h148.5v2Z"
          mask="url(#e)"
        />
        <rect
          width={86.474}
          height={23.5}
          x={44.755}
          y={21.5}
          fill="#FCFCFC"
          stroke="#E6E8EB"
          rx={2.5}
        />
        <rect
          width={86.474}
          height={23.5}
          x={44.755}
          y={51.5}
          fill="#FCFCFC"
          stroke="#E6E8EB"
          rx={2.5}
        />
        <rect width={19.232} height={1.5} x={52.941} y={28} fill="#525252" rx={0.75} />
        <rect width={19.232} height={1.5} x={52.941} y={56.5} fill="#525252" rx={0.75} />
        <rect width={19.232} height={1.5} x={78.376} y={28} fill="#11181C" rx={0.75} />
        <rect width={19.232} height={1.5} x={78.376} y={56.5} fill="#11181C" rx={0.75} />
        <rect width={44.047} height={1.5} x={78.376} y={33.25} fill="#11181C" rx={0.75} />
        <rect width={44.047} height={1.5} x={78.376} y={61.75} fill="#11181C" rx={0.75} />
        <rect width={5} height={5} x={150} y={4.625} fill="#5bbc26" rx={100} />
        <rect width={20.5} height={3.75} x={18.492} y={4.625} fill="#5bbc26" rx={1.875} />
        <rect width={20.5} height={3.75} x={44.255} y={4.625} fill="#B2B2B2" rx={1.875} />
        <rect width={20.5} height={3.75} x={69.505} y={4.625} fill="#B2B2B2" rx={1.875} />
        <rect width={20.5} height={1.5} x={101.923} y={28} fill="#5bbc24" rx={0.75} />
      </g>
    </g>
    <rect width={160.5} height={87} x={1.242} y={0.5} stroke="#2E2E2E" rx={5.5} />
    <defs>
      <clipPath id="a">
        <rect width={161.5} height={88} x={0.742} fill="#fff" rx={6} />
      </clipPath>
    </defs>
  </svg>
)

const SystemSkeleton = memo(SystemSkeletonSvg)
const LightSkeleton = memo(LightSkeletonSvg)
const DarkSkeleton = memo(DarkSkeletonSvg)

export { LightSkeleton, DarkSkeleton, SystemSkeleton }
